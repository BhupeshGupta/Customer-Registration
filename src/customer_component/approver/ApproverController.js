export default class ApproverController {

  constructor($cookies, $http, settings, $localStorage) {
    this.$cookies = $cookies;
    this.$http = $http;
    this.isuser = this.auth();
    this.settings = settings;
    this.storage = $localStorage;
    this.populate_data();
  }

  auth() {
    if (this.$cookies.get('sid')) {
      return true;
    } else
      return false;
  }

  authenticate(username, password) {
    this.$http.get(this.settings.erpServerUrl() + '/api/method/login?usr=' + username + '&pwd=' + password)
      .then((res) => {
        this.storage.full_name = res.data.full_name;
        this.storage.sid = res.data.sid;
        this.isuser = true;
      })
  }

  populate_data() {
    this.$http.get(this.settings.pythonServerUrl() + '/display_details').then((res) => {
      this.full_data = res.data;
    })
  }

  approve(individualData) {

    angular.forEach(individualData, (data, key) => {
      if (data.doctype) {
        this.$http.post('http://localhost:9005/approver', {
          'data': data
        })
      }
    })

  }
}
