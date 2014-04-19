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

.controller('PatientCtrl', function($scope, $stateParams, PatientService, NFCService, PrescriptionEnumService, PrescriptionService, DrugService) {
  $scope.patient = PatientService.get({ patientId: $stateParams.patientId });
  $scope.callbackId = NFCService.register(function (tagId) {
    $scope.patient.tag_id = tagId;
    $scope.patient.$update();
  });

  $scope.prescriptions = PrescriptionService.query({ patient_id: $scope.patient._id });
  $scope.drugs = DrugService.query();


  $scope.getDrug = function(drug_id) {
    return _.filter($scope.drugs, function(drug) {
      return drug._id === drug_id;
    })[0];
  };

  PrescriptionEnumService.then(function(data) {
    $scope.prescriptionEnums = data;
  });

  $scope.$on('$destroy', function () {
    NFCService.deRegister($scope.callbackId);
  });
});
