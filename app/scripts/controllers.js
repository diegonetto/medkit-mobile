'use strict';
angular.module('Medkit.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, UserService) {
  $scope.user = {
    username: '',
    password: ''
  };
  $ionicModal.fromTemplateUrl('templates/login-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
    //modal.show();
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function () {
    $scope.modal.remove();
  });

  $scope.login = function () {
    var user = new UserService($scope.user);
    user.$login({}, function () {
      $scope.closeModal();
    }, function () {
      // ERROR TODO
      console.log('Login FAILED');
    });
  };


})

.controller('PatientsCtrl', function($scope, $ionicModal, PatientService) {
  $scope.patients = PatientService.query();
  $scope.patient = {};

  // Add Patient Modal 
  $ionicModal.fromTemplateUrl('templates/add-patient-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function () {
    $scope.modal.remove();
  });

  $scope.newPatient = function() {
    $scope.openModal();
  };

  $scope.addPatient = function() {
    console.log($scope.patient);
    var patient = new PatientService($scope.patient);
    patient.$save();
    $scope.closeModal();
    $scope.patients = PatientService.query();
  };

})

.controller('PatientCtrl', function($scope, $stateParams, $ionicModal, $ionicActionSheet, $ionicListDelegate, PatientService, NFCService, PrescriptionEnumService, PrescriptionService, DrugService, DosageService) {

  $scope.dosage = {};

  $scope.updatePrescriptions = function () {
    console.log($scope.patient._id);
    $scope.prescriptions = PrescriptionService.query({ patient_id: $scope.patient._id });
    $scope.prescription = {};
  };

  $scope.patient = PatientService.get({ _id: $stateParams.patientId }, function (patient) {
    $scope.updatePrescriptions();
    console.log(patient.tag_id);
    if (!patient.tag_id) {
      $scope.patientTagCallbackID = NFCService.register(function (tagId) {
        console.log('Attempting to add patient tag');
        $scope.patient.tag_id = tagId;
        console.log($scope.patient._id);

        $scope.patient.$update({ _id: $scope.patient._id }, function () {
          console.log('Updated patient!!');
          NFCService.deRegister($scope.patientTagCallbackID);
        }, function (err) {
          console.log('failed to add patient tag');
          console.log(JSON.stringify(err));
        });
      });
    }
  });
 
  $scope.prescription = {};
  $scope.selectedPrescriptions = [];
  $scope.drugs = DrugService.query();


  $scope.getDrug = function(drug_id) {
    return _.filter($scope.drugs, function(drug) {
      return drug._id === drug_id;
    })[0];
  };

  PrescriptionEnumService.then(function(data) {
    $scope.prescriptionEnums = data;
  });

  // Add Prescription Modal
  $ionicModal.fromTemplateUrl('templates/add-prescription-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  // Add prescription flow
  $scope.addPrescription = function() {

    var prescription = new PrescriptionService({
      drug_id: $scope.prescription.drug._id,
      patient_id : $scope.patient._id,
      route : $scope.prescription.route,
      interval : $scope.prescription.interval,
      amount : $scope.prescription.amount,
      unit : $scope.prescription.unit,
      intervalType : $scope.prescription.intervalType
    });

    prescription.$save(function () {
      $scope.closeModal();
      $scope.updatePrescriptions();
      console.log('success');
    }, function (err) {
      console.log(JSON.stringify(err));
    });
  };

  $scope.removePrescription = function(prescription) {
    console.log(prescription);
    $ionicActionSheet.show({
      destructiveText: 'Delete',
      titleText: 'Delete this prescription?',
      cancelText: 'Cancel',
      cancel: function () {
        console.log('Cancelled');
      },
      destructiveButtonClicked: function () {
        prescription.$delete({ _id: prescription._id }, function () {
          $scope.updatePrescriptions();
        });
        return true;
      }
    });
  };

  $scope.togglePrescriptionSelect = function(prescription) {
    prescription.selected = prescription.selected ? false : true;
    if (prescription.selected) {
      $scope.selectedPrescriptions.push(prescription);
    } else {
      _.remove($scope.selectedPrescriptions, prescription);
    }
    console.log($scope.selectedPrescriptions);
    $ionicListDelegate.closeOptionButtons();
  };


  // Fill prescription modal
  $ionicModal.fromTemplateUrl('templates/fill-prescription-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.fillModal = modal;
  });

  $scope.openFillModal = function() {
    $scope.fillModal.show();
    $scope.dosageTagCallbackID = NFCService.register(function (tagId) {
      console.log('Attempting to add DOSAGE tag');
      $scope.dosage.tag_id = tagId;
      $scope.$apply();
      console.log(JSON.stringify($scope.dosage));
    });
  };

  $scope.closeFillModal = function() {
    $scope.fillModal.hide();
    NFCService.deRegister($scope.dosageTagCallbackID);
  };

  // Fill prescription button
  $scope.fillPrescription = function () {
    console.log('Fill these guys in a modal');
    $scope.openFillModal();
    console.log($scope.selectedPrescriptions);
  };

  // Submit the dosage information
  $scope.submitDosage = function () {
    var dosage = new DosageService({
      tag_id: $scope.dosage.tag_id,
      prescriptions: $scope.selectedPrescriptions,
      patient_id: $scope.patient._id
    });
    dosage.$save();
    $scope.closeFillModal();
  };

  $scope.$on('$destroy', function () {
    NFCService.deRegister($scope.patientTagCallbackID);
    $scope.modal.remove();
    $scope.fillModal.remove();
  });
})

.controller('FillPrescriptionCtrl', function($scope) { });
