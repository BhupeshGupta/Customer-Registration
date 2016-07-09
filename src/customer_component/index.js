import angular from 'angular';
import {index} from './customer/wrapper';
import multiStepForm from 'angular-multi-step-form';
import 'lf-ng-md-file-input/dist/lf-ng-md-file-input.js';
import 'lf-ng-md-file-input/dist/lf-ng-md-file-input.css';
import Uploader from './services/docuploader/UploaderService'


export default angular
  .module('CustomerModule',[multiStepForm.name, 'lfNgMdFileInput'])
  .component('customer', index)
  .service('Uploader', Uploader)
  .name;
