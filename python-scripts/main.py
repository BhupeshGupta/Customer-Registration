from tin import verify_tin
from pan import IncomeTaxPanPortal
import bottle
from bottle import post, run, request, get, static_file,Bottle, route, response
from script import CbecEasiestPortal
app = Bottle()
import json
import requests
import os
from alfresco import AlfrescoApi
import redis
from bottle import static_file
import uuid
import ast


config = {}
with open('config.json', 'r') as config_file:
    config = json.loads(config_file.read())

try:
    connection = redis.StrictRedis(host='localhost', port=6379, db=0)
    if not connection:
        raise Exception('Database Not connected')


    def push_in_alfresco(data):
      print data
      alfresco = AlfrescoApi()
      upload = alfresco.main(data)
      return upload

    def attach_in_erp(sid, primary_key, name, workspace_url):
      fileurl = config['ALFRESCO_DB_HOST'] + '/share/page/site/documents/document-details?nodeRef=' + workspace_url
      print fileurl
      r = requests.post(
        config['erpServerUrl'] + '/',
        data={'sid':sid ,'cmd': 'uploadfile',
              'file_url': fileurl,
              'doctype':'Customer',
              'docname':primary_key,
              'from_form': 'true'})
      print r.status_code
      print r.text



    def enable_cors(fn):
        def _enable_cors(*args, **kwargs):
            # set CORS headers
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
            response.headers[
                'Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

            if bottle.request.method != 'OPTIONS':
                return fn(*args, **kwargs)

        return _enable_cors


    @route('/tin', method=['GET'])
    @enable_cors
    def verify():
        return verify_tin(request.query.tin_number)


    @route('/pan', method=['GET'])
    @enable_cors
    def init_request():
        portal = IncomeTaxPanPortal()
        return {
            'captcha_path': portal.init_session(),
            'token': portal.dump_session()
        }

    @get('/captcha/<file>')
    def get_captcha(file):
        return static_file(file, root='/tmp/')


    @route('/excise', method=['OPTIONS', 'GET'])
    @enable_cors
    def get_excise():
        portal = CbecEasiestPortal()
        return {
            'captcha_path': portal.init_session(),
            'token': portal.dump_session()
        }

    @route('/getexciseinfo', method=['OPTIONS', 'POST'])
    @enable_cors
    def get_excise_info():
        if request.method == 'OPTIONS':
            return {}
        result = {}
        json_request = request.json
        captcha = json_request.get('captchaCode')
        excise_no = json_request.get('exciseNumber')
        token = json_request.get('token')
        service_tax = json_request.get('serviceTax')
        portal = CbecEasiestPortal()
        portal.load_session(token)
        portal.set_captcha(captcha)
        if excise_no:
            result["excise"] = portal.get_excise_info(excise_no)
        if service_tax:
            result["service"] = portal.get_service_info(service_tax)
        return result


    @route('/getPanInfo', method=['OPTIONS', 'POST'])
    @enable_cors
    def get_pan_info():
        if request.method == 'OPTIONS':
            return {}

        json_request = request.json

        token = json_request.get('token')
        captcha = json_request.get('captcha')
        pan_no = json_request.get('pan_no')

        portal = IncomeTaxPanPortal()
        portal.load_session(token)
        portal.set_captcha(captcha)
        pan_details = portal.get_pan_info(pan_no)
        return pan_details


    @route('/upload', method=['OPTIONS', 'POST'])
    @enable_cors
    def save_temp():
        upload = request.files.get('file')
        data = {key: request.forms.get(key) for key in request.forms}
        doctype  = data['doctype']
        name, ext = os.path.splitext(upload.filename)
        if ext not in ('.png', '.jpg', '.jpeg'):
            return 'File extension not allowed.'
        image_path = "/home/hackerx/Documents/docs/{}{}".format(uuid.uuid4(),ext)
        upload.save(image_path ,overwrite=True)
        return {
            "image_path" : image_path,
            "doctype": doctype
        }


    @route('/submit', method=['OPTIONS', 'POST'])
    @enable_cors
    def submit():
        json_request = request.json
        data = json_request.get('data')
        connection.lpush('customer_data', str(data))
        return


    @route('/display_details', method=['OPTIONS', 'GET'])
    @enable_cors
    def display_data():
        q = []
        if connection.llen('customer_data'):
            for x in range(connection.llen('customer_data')):
                p = (connection.lindex('customer_data', x))
                q.append(ast.literal_eval(p))
            return json.dumps(q)
        else:
            return "nothing found in the database"





    @route('/download_doc', method=['OPTIONS', 'GET','POST'])
    @enable_cors
    def approve():
        if request.method == 'OPTIONS':
            return {}
        data = request.forms.get('data')
        data_json = json.loads(data)
        data = data_json['data']
        data = json.dumps(data)
        r = requests.post(config['erpServerUrl'] + '/api/method/flows.flows.controller.customer_creation.serve_html', data={'data': data})
        if (r.status_code == 409):
            print "user exists"
        elif (r.status_code == 502):
            print "down"
        else:
            body = r.text
            return bottle.HTTPResponse(body=body,
                                       headers=[('Content-Disposition', 'attachment; filename="qwerty.doc"'),
                                                ('Content-type', 'application/doc'),
                                                ('Server', 'WSGIServer/0.1 Python/2.7.11+'),
                                                ('Access-Control-Allow-Credentials', 'true'),
                                                ('Access-Control-Allow-Headers',
                                                 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type'),
                                                ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
                                                ('Access-Control-Allow-Origin', '*')])

        return


    @route('/create_customer_aprover', method=['OPTIONS', 'GET', 'POST'])
    @enable_cors
    def approve():
      if request.method == 'OPTIONS':
        return {}
      json_request = request.json
      data = json_request.get('data')
      sid = json_request.get('sid')
      customer_creation_data = json.dumps({
        'customerData': data['customerData'],
        'customerAddressData': data['customerAddressData'],
        'customerContact': data['customerContact']
      })
      r = requests.post(
        config['erpServerUrl'] + '/api/method/flows.flows.controller.customer_creation.approve',
        data={'data': customer_creation_data,'sid':sid})
      if (r.status_code == 409):
        print "user exists"
      elif (r.status_code == 502):
        print "down"
      response = r.json()
      primary = response['message']
      print primary

      print data
      for (key) in data:
        if key in ['tin','pan','excise','service_tax']:
          upload_file_data = push_in_alfresco(data[key])
          attach_in_erp(sid, primary, upload_file_data['fileName'], upload_file_data['nodeRef'])












    if __name__ == "__main__":
        run(host="0.0.0.0", port=9005)

except Exception as e:
    print e
