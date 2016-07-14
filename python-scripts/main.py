from tin import verify_tin
from pan import IncomeTaxPanPortal
import bottle
from bottle import post, run, request, get, static_file,Bottle, route, response
from script import CbecEasiestPortal
app = Bottle()
import json
import os
from alfresco import AlfrescoApi

# the decorator
def enable_cors(fn):
    def _enable_cors(*args, **kwargs):
        # set CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

        if bottle.request.method != 'OPTIONS':
            # actual request; reply with the actual response
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

from bottle import static_file
@get('/captcha/<file>')
def get_captcha(file):
    return static_file(file, root='/tmp/')


@route('/excise', method=['OPTIONS','GET'])
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
    result= {}
    json_request = request.json
    captcha = json_request.get('captchaCode')
    excise_no = json_request.get('exciseNumber')
    token = json_request.get('token')
    service_tax = json_request.get('serviceTax')
    portal = CbecEasiestPortal()
    portal.load_session(token)
    portal.set_captcha(captcha)
    if excise_no:
        result["excise"]= portal.get_excise_info(excise_no)
    if service_tax:
        result["service"]= portal.get_service_info(service_tax)
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
   return portal.get_pan_info(pan_no)



@route('/upload', method=['OPTIONS', 'POST'])
@enable_cors
def prepare_for_alfresco():
    upload = request.files.get('file')
    data = json.dumps({key: request.forms.get(key) for key in request.forms})
    alf = AlfrescoApi()
    alf.main(upload, data)
    return



if __name__ == "__main__":
    run(host="0.0.0.0", port=9005)

