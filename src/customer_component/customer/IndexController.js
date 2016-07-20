var step = require("./form/step.html");
var step1 = require("./form/step1.html");
var step2 = require("./form/step2.html");
var step3 = require("./form/step3.html");
var step4 = require("./form/step4.html");


export default class IndexController {

  constructor($http, FileUploader) {
    this.istin = false;
    this.ispan = false;
    this.$http = $http;
    this.stage = 0;
    this.documents = [];
    this.full_data = {};
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
    }, {
      template: step4,
      title: 'Get the source'
    }];

    this.response = angular.bind(this, this.response);

  }

  getCaptcha() {
    let vm = this;
    this.$http.get('http://localhost:9005/pan')
      .then(data => {
        this.token = data.data.token,
          vm.captcha_path = 'http://localhost:9005/captcha/' + data.data.captcha_path
      })
      .catch(error => {
        alert("there was an error. Kindly visit Administrator");
      });
    this.$http.get('http://localhost:9005/excise')
      .then(data => {
        vm.captcha_path1 = 'http://localhost:9005/captcha/' + data.data.captcha_path,
          this.token1 = data.data.token
      })
      .catch(error => {
        console.log("there was an error. Kindly visit Administrator");
      });

  }

  getTin(tin) {
    this.$http.get('http://localhost:9005/tin', {
        params: {
          'tin_number': tin
        }
      })
      .then(data => {
        this.tin_Details = data.data;
        if (this.tin_Details) {
          this.istin = true;
          this.tin_Details.doctype = "tin";
          this.tin_Details.number = tin;
          this.documents.push("tin");

        }
      })
      .catch(error => {
        alert("fukcer call the admin bitch");
      });
  }

  getpan(pan, captchaCode) {
    let vm = this;
    this.$http.post('http://localhost:9005/getPanInfo', {
        'token': this.token,
        'captcha': captchaCode,
        'pan_no': pan,

      })
      .then(data => {
        this.pan_Details = data.data;
        if (vm.pan_Details) {
          this.ispan = true;
          this.documents.push("pan");
          this.pan_Details.doctype = "pan";
          this.pan_Details.number = pan;
        }
      })
      .catch(error => {});
  }


  getExcise(exciseNumber, captchaCode, serviceTax) {
    this.$http.post('http://localhost:9005/getexciseinfo', {
      'token': this.token1,
      'captchaCode': captchaCode,
      'exciseNumber': exciseNumber,
      'serviceTax': serviceTax

    }).then(data => {
      this.Details = data.data;
      if (this.Details.excise) {
        console.log(this.Details.excise);
        this.excise_Details = this.Details.excise;
        this.excise_Details.doctype = "excise";
        this.excise_Details.number = exciseNumber;
        this.documents.push("excise");
      }
      if (this.Details.service) {
        this.service_tax_Details = this.Details.service;
        this.service_tax_Details.doctype = "service_tax";
        this.service_tax_Details.number = serviceTax;
        this.documents.push("service_tax");
      }
    }).catch(error => {
      console.log(error);
    });
  }


  response(response, status, headers) {
    if (response.doctype == "service_tax")
      this.service_tax_Details.image_path = response.image_path;
    if (response.doctype == "tin")
      this.tin_Details.image_path = response.image_path;
    if (response.doctype == "pan")
      this.pan_Details.image_path = response.image_path;
    if (response.doctype == "excise")
      this.excise_Details.image_path = response.image_path;
  }

  // collect_user_data()
  // {
  //   this.
  // }

  final_submit() {
    this.full_data.tin = this.tin_Details;
    this.full_data.service_tax = this.service_tax_Details;
    this.full_data.pan = this.pan_Details;
    this.full_data.excise = this.excise_Details;
    this.$http.post('http://localhost:9005/submit', {
      'data': this.full_data
      })
  }


}
