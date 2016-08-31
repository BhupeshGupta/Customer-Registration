var step = require("./form/step.html");
var step1 = require("./form/step1.html");
var step2 = require("./form/step2.html");
var step3 = require("./form/step3.html");
var step4 = require("./form/step4.html");
var $ = require("jquery");
var alertify = require('alertify.js');


export default class IndexController {

  constructor($http, settings, FileUploader) {
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
    this.country = ('India').split(',').map(function(state) {
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

    this.customerContact = {
      "first_name": "",
      "last_name": "",
      "phone": "",
      "email_id": "",
      "sms_optin": "",
      "customer": ""
    }

    this.uploader.filters.push({
      name: 'size',
      fn: function(item) {
        if (item.size < 5245329)
          return true;
        else
          alertify.alert("Kindly Select a Image less than 5 Mb");
      }
    });
    this.uploader.filters.push({
      name: 'ext',
      fn: function(item) {
        if (item.type.split("/").indexOf("image") <= -1)
          alertify.alert("kindly upload a image with proper extension");
        else
          return true;
      }
    });
  }

  getCaptcha() {
    let vm = this;
    this.$http.get(this.settings.pythonServerUrl() + '/pan')
      .then(data => {
        console.log("Pan is entered");
        this.token = data.data.token,
          vm.captcha_path = this.settings.pythonServerUrl() + '/captcha/' + data.data.captcha_path;
        console.log(vm.captcha_path)
      })
      .catch(error => {
        alertify.alert("there was an error. Kindly Reload the page or contact Administartor");
      });
    this.$http.get(this.settings.pythonServerUrl() + '/excise')
      .then(data => {
        vm.captcha_path1 = this.settings.pythonServerUrl() + '/captcha/' + data.data.captcha_path,
          this.token1 = data.data.token
      })
      .catch(error => {
        alertify.alert("there was an error. Kindly visit Administrator");
      });
  }

  getTin(tin) {
    this.$http.get(this.settings.pythonServerUrl() + '/tin', {
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
        alertify.alert("call the admin");
      });
  }

  getpan(pan, captchaCode) {
    let vm = this;
    this.$http.post(this.settings.pythonServerUrl() + '/getPanInfo', {
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
      .catch(error => {
        console.log(error);
      });
  }


  getExcise(exciseNumber, captchaCode, serviceTax) {
    this.$http.post(this.settings.pythonServerUrl() + '/getexciseinfo', {
      'token': this.token1,
      'captchaCode': captchaCode,
      'exciseNumber': exciseNumber,
      'serviceTax': serviceTax

    }).then(data => {
      this.Details = data.data;
      console.log(this.Details);
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
    this.full_data.customerData = this.customerData;
    this.full_data.customerAddressData = this.customerAddressData;
    this.full_data.customerContact = this.customerContact;
    this.data = JSON.stringify({
      'data': {
        'customerData': this.customerData,
        'customerAddressData': this.customerAddressData,
        'customerContact': this.customerContact
      }
    });
    $('<form>', {
      "action": this.settings.pythonServerUrl() + '/download_doc',
      "method": 'post',
      "id": 'data'
    }).append($('<input />', {
      "name": 'data',
      "value": this.data
    })).appendTo(document.body).submit();
    this.$http.post(this.settings.pythonServerUrl() + '/submit', {
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
    console.log(this.customerContact);
    if (this.customerContact.sms_optin == true)
      this.customerContact.sms_optin = "1";
    if (this.customerContact.sms_optin == false)
      this.customerContact.sms_optin = "0";
    if (this.customerAddressData.is_primary_address == true)
      this.customerAddressData.is_primary_address = "1";
    if (this.customerAddressData.is_primary_address == false)
      this.customerAddressData.is_primary_address = "0";
    if (this.customerAddressData.is_shipping_address == true)
      this.customerAddressData.is_shipping_address = "1";
    if (this.customerAddressData.is_shipping_address == false)
      this.customerAddressData.is_shipping_address = "0";
  }

}
