var step = require("./form/step.html");
var step1 = require("./form/step2.html");
var step2 = require("./form/step1.html");
var step3 = require("./form/step3.html");
var step4 = require("./form/step4.html");
var $ = require("jquery");

export default class IndexController {

  constructor($http, settings, FileUploader) {
    this.istin = false;
    this.ispan = false;
    this.$http = $http;
    this.stage = 0;
    this.documents = [];
    this.settings = settings;
    this.full_data = {};
    this.getCaptcha();
    this.uploader = new FileUploader();
    $http.withCredentials = true

    this.serviceTaxType = ('Consignee(Customer),Transporter').split(',').map(function(type) {
      return {
        abbrev: type
      };
    });
    this.customerType = ('Company,Public Limited,Proprietorship,Partnership,Society,Trust,Individual').split(',').map(function(type) {
      return {
        abbrev: type
      };
    });
    this.address_type = ('Billing Shipping Office Warehouse').split(' ').map(function(state) {
      return {
        abbrev: state
      };
    });
    this.states = ('Arunchal-pradesh,punjab,anything,something,everything,nothing').split(',').map(function(state) {
      return {
        abbrev: state
      };
    });
    this.country = ('India1,India2,India3,India4,India5,India').split(',').map(function(state) {
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
    this.customerAddressData = {
      "customer": "",
      "address_title": "",
      "address_type": "",
      "address_line1": "",
      "address_line2": "",
      "city": "",
      "state": "",
      "pincode": "",
      "country": "",
      "email_id": "",
      "phone": "",
      "fax": "",
      "is_primary_address": "",
      "is_shipping_address": ""
    }

    this.customerData = {
      "customer_name": "",
      "customer_type": "",
      "pan_number": "",
      "tin_number": "",
      "service_tax_liability": "",
      "service_tax_number": "",
      "ecc_number": "",
      "excise_commissionerate_code": "",
      "excise_range_code": "",
      "excise_division_code": "",
    }

    this.contact = {
      "first_name": "",
      "last_name": "",
      "phone": "",
      "email_id": "",
      "sms_optin": "",
      "customer": ""
    }

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
        this.tin_Details.image_path = [];
        if (this.tin_Details) {
          this.istin = true;
          this.tin_Details.doctype = "tin";
          this.tin_Details.number = tin;
          this.documents.push("tin");
        }
      })
      .catch(error => {
        alert("call the admin");
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
        this.pan_Details.image_path = [];
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
        this.excise_Details = this.Details.excise;
        this.excise_Details.image_path = [];
        this.excise_Details.doctype = "excise";
        this.excise_Details.number = exciseNumber;
        this.documents.push("excise");
      }
      if (this.Details.service) {
        this.service_tax_Details = this.Details.service;
        this.service_tax_Details.image_path = [];
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
      this.service_tax_Details.image_path.push(response.image_path);
    if (response.doctype == "tin")
      this.tin_Details.image_path.push(response.image_path);
    if (response.doctype == "pan")
      this.pan_Details.image_path.push(response.image_path);
    if (response.doctype == "excise")
      this.excise_Details.image_path.push(response.image_path);
  }

  final_submit() {
    this.full_data.tin = this.tin_Details;
    this.full_data.service_tax = this.service_tax_Details;
    this.full_data.pan = this.pan_Details;
    this.full_data.excise = this.excise_Details;
    this.$http.post('http://localhost:9005/submit', {
      'data': this.full_data
    })
  }

  autofill() {
    if (this.documents.indexOf("excise") >= 0) {
      this.customerData.ecc_number = this.excise_Details.number;
      this.customerData.excise_commissionerate_code = this.excise_Details.ECCDetailsCommCode;
      this.customerData.ecc_number = this.excise_Details.excise_no;
      this.customerData.excise_range_code = this.excise_Details.ECCDetailsRangeCode;
      this.customerData.excise_division_code = this.excise_Details.ECCDetailsDivCode;
    }
    if (this.documents.indexOf("tin") >= 0)
      this.customerData.tin_number = this.tin_Details.number;
    if (this.documents.indexOf("pan") >= 0)
      this.customerData.pan_number = this.pan_Details.number;
    if (this.documents.indexOf("service_tax") >= 0)
      this.customerData.service_tax_number = this.service_tax_Details.number;
    console.log(this.customerData);
  }

  contactDetails() {
    if (this.contact.sms_optin == true)
      this.contact.sms_optin = "1";
    if (this.contact.sms_optin == false)
      this.contact.sms_optin = "0";
    if (this.customerAddressData.is_primary_address == true)
      this.contact.is_primary_address = "1";
    if (this.customerAddressData.is_primary_address == false)
      this.contact.is_primary_address = "0";
    if (this.customerAddressData.is_shipping_address == true)
      this.contact.sms_optin = "1";
    if (this.customerAddressData.is_shipping_address == false)
      this.contact.sms_optin = "0";
    this.data = JSON.stringify({
      'data': {
        'customerData': this.customerData,
        'customerAddressData': this.customerAddressData,
        'customerContact': this.contact
      }
    });

    console.log("this");
    console.log(this.data);
    $('<form>', {
        "action": 'http://localhost:9005/address',
        "method": 'post',
        "id": 'data'
      }).append($('<input />', {
        "name": 'data',
        "value": this.data
      })).appendTo(document.body).submit();
  }

}
