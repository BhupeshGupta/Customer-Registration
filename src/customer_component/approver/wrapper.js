import ApproverController from './ApproverController';
import './style.css';

var approver = {
  controller: ApproverController,
  controllerAs: 'approver',
  template: require('./index.html'),
};

export {approver};
