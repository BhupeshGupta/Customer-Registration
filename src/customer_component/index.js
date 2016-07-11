import angular from 'angular';
import {index} from './customer/wrapper';
import multiStepForm from 'angular-multi-step-form';
import 'angular-file-upload/dist/angular-file-upload.js';
import Uploader from './services/docuploader/UploaderService';
import './services/directives/thumb.js';


export default angular
  .module('CustomerModule',[multiStepForm.name,'angularFileUpload','app'])
  .component('customer', index)
  .service('Uploader', Uploader)
  .name;
