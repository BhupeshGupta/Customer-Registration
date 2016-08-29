import 'angular/angular-csp.css';
import './index.scss';
import './assests/css/bootstrap.css';
import './assests/css/style.css';
import angular from 'angular';
import CustomerModule from './customer_component/index';
import 'angular-material/angular-material.css';
import 'font-awesome/css/font-awesome.min.css';
import angularAnimate from 'angular-animate';
import angularMaterial from 'angular-material';
import ngMessages from 'angular-messages';
import 'angular-loading-bar';
import 'angular-loading-bar/build/loading-bar.css';


angular.module('formapp', [
  CustomerModule, angularMaterial, ngMessages, 'angular-loading-bar'
]).config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
  cfpLoadingBarProvider.spinnerTemplate = '<div><span class="loading-gif">Loading...</div>';
}]);

angular.bootstrap(document.documentElement, ['formapp']);
