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








angular.module('formapp', [
  CustomerModule, angularMaterial, ngMessages
]);



angular.bootstrap(document.documentElement, ['formapp']);
