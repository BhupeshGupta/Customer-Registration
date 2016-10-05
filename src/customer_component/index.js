import angular from 'angular';
import {
  index
} from './customer/wrapper';
import {
  approver
} from './approver/wrapper'
import multiStepForm from 'angular-multi-step-form';
import ngCookies from 'angular-cookies';
import 'angular-file-upload/dist/angular-file-upload.js';
import SettingService from './services/SettingsService';
import './services/directives/thumb.js';
import 'ngstorage/ngStorage.js';
import 'angular-svg-round-progressbar/build/roundProgress.js';


export default angular
  .module('CustomerModule', [multiStepForm.name, 'angularFileUpload', 'app', 'ngStorage', ngCookies])
  .component('customer', index)
  .component('approver', approver)
  .service('settings', SettingService)
  .name;
