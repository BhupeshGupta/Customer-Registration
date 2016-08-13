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
      this.sid = this.$cookies.get('sid');
      console.log(this.sid);
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
      console.log(res.data);
    })
  }

  approve(key, individualData) {
    console.log(individualData);
    this.$http.post(this.settings.pythonServerUrl() + '/create_customer_aprover', {
        'sid': this.sid,
        'data':individualData
      }).then(data => {
        if (data.data['status_code'] != 200){
          console.log("AN ERROR HAS OCCURED");
          console.log(data.data['msg']);
        }
      })
      .catch(error => {
        console.log(error);
      })

  }
}
