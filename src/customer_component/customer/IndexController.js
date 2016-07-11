var step = require("./form/step.html");
var step1 = require("./form/step1.html");
var step2 = require("./form/step2.html");
var step3 = require("./form/step3.html");

export default class IndexController {

  constructor($http, FileUploader) {
    this.tin = false;
    this.pan = false;
    this.$http = $http;
    this.stage = 0;
    this.documents = [];
    this.getCaptcha();
    this.uploader = new FileUploader();

    this.address_type = ('Billing Shipping Office Warehouse').split(' ').map(function(state) {
      return {
        abbrev: state
      };
    });
    this.states = ('Arunchal-pradesh').split(' ').map(function(state) {
      return {
        abbrev: state
      };
    });
    this.steps = [{
      template: step,
      title: 'Get the source',
    }, {
      template: step1,
      title: 'Get the source'
    }, {
      template: step2,
      title: 'Get the source'
    }, {
      template: step3,
      title: 'Get the source'
    }];

  }

  getTin(tin) {
    this.$http.get('http://localhost:9005/tin', {
        params: {
          'tin_number': tin
        }
      })
      .then(data => {
        this.tinDetail = data.data;
        if (this.tinDetail) {
          this.tin = true;
          this.documents.push("tinDetail");
        }
      })
      .catch(error => {
        alert("fukcer call the admin bitch");
      });
  }
  getCaptcha() {
    let vm = this;
    if (this.stage == 0) {
      this.$http.get('http://localhost:9005/pan')
        .then(data => {
          this.token = data.data.token,
            vm.captcha_path = 'http://localhost:9005/captcha/' + data.data.captcha_path
        })
        .catch(error => {
          alert("there was an error. Kindly visit Administrator");
        });
    } else if (this.stage) {
      this.$http.get('http://localhost:9005/excise')
        .then(data => {
          vm.captcha_path1 = 'http://localhost:9005/captcha/' + data.data.captcha_path,
            this.token1 = data.data.token
        })
        .catch(error => {
          console.log("there was an error. Kindly visit Administrator");
        });
    }

  }

  getpan(pan, captchaCode) {
    this.$http.post('http://localhost:9005/getPanInfo', {
        'token': this.token,
        'captcha': captchaCode,
        'pan_no': pan,

      })
      .then(data => {
        this.panDetail = data.data;
        if (this.panDetail) {
          this.pan = true;
          this.documents.push("panDetail");
        }
      })
      .catch(error => {});
  }



  step_states_increase() {
    ++this.stage;
    console.log(this.stage);
  }
  step_states_decrease() {
    --this.stage;
    console.log(this.stage);
  }

  getExcise(exciseNumber, captchaCode, serviceTax) {
    this.$http.post('http://localhost:9005/getexciseinfo', {
      'token': this.token1,
      'captchaCode': captchaCode,
      'exciseNumber': exciseNumber,
      'serviceTax': serviceTax

    }).then(data => {
      this.exciseDetails = data.data;
      if (this.exciseDetails.excise)
        this.documents.push("exciseDetails.excise");
      if (this.exciseDetails.service)
        this.documents.push("exciseDetails.service");
      console.log(this.documents);
    }).catch(error => {
      console.log(error);
    });
  }
}
