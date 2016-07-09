import IndexController from './IndexController';
import './style.css'
/* @ngInject */

var index = {
  controller: IndexController,
  controllerAs: 'index',
  template: require('./index.html'),
};

export {index};
