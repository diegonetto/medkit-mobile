'use strict';

var API = 'http://192.168.1.148:8080';

angular.module('Medkit.services', [])

.factory('PatientService', function ($resource) {
  var Patient = $resource(API + '/patient/:patientId', {}, {
    update: {
      method: 'PUT',
    }
  });
  return Patient;
})


.factory('PrescriptionEnumService', function ($http, $q) {
  var intervalDeferred = $q.defer();
  var routeDeferred = $q.defer();
  var unitDeferred = $q.defer();

  var IntervalEnum = $http({method: 'GET', url: API + '/intervaltype'})
    .success(function(data) {
      intervalDeferred.resolve(data);
    });
  var RouteEnum = $http({method: 'GET', url: API + '/route'})
    .success(function(data) {
      routeDeferred.resolve(data);
    });
  var UnitEnum = $http({method: 'GET', url: API + '/unit'})
    .success(function(data) {
      unitDeferred.resolve(data);
    });

  return $q.all({
    interval: intervalDeferred.promise,
    route: routeDeferred.promise,
    unit: unitDeferred.promise
  });
})

.factory('PrescriptionService', function ($resource) {
  var Prescription = $resource(API + '/prescription/:prescriptionId', {}, {
    update: {
      method: 'PUT',
    }
  });
  return Prescription;
})

.factory('DrugService', function ($resource) {
  var Drug = $resource(API + '/drug/:drugId');
  return Drug;
})

.factory('UserService', function ($resource) {
  var User = $resource(API + '/user', {}, {
    login: {
      method: 'POST',
      url: API + '/login',
      params: {username: '@username', password: '@password'}
    }
  });
  return User;
})

.factory('NFCService', function () {
  
  var callbacks = [];

  // Add a listener and invoke each callback with discovered Tag Id.
/*  nfc.addTagDiscoveredListener(function (NFCevent) {
    console.log('Disovered a tag!');
    var tagId = btoa(NFCevent.tag.id);
    _.forEach(callbacks, function(cb) {
      cb(tagId);
    });
  }, function () {
    console.log('Successfully added NDEF listener');
  }, function () {
    console.log('Error adding NDEF listener');
  });*/

  var NFC = {};

  // Return the index of the registered callback
  NFC.register = function (callback) {
    var idx = callbacks.push(callback) - 1;
    console.log('NFCService --- registered callback ' + idx);
    return idx;
  };

  NFC.deRegister = function (idx) {
    console.log('NFCService --- deregistered callback ' + idx);
    _.remove(callbacks, function(cb, i) {
      return idx === i;
    });
  };

  return NFC;
});
