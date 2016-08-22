import shutil
import json
from bs4 import BeautifulSoup
from bottle import route, run, template, post, request, static_file
import requests.utils
import pickle
import base64


class IncomeTaxPanPortal:
   ACTIVE = 'ACTIVE'
   INVALID = 'INVALID'

   def __init__(self):
      self.headers = {
         # Accept all
         'Accept': '*/*',
         # Disable Gzip
         'Accept-Encoding': '',
         'Connection': 'keep-alive',
         'Host': 'incometaxindiaefiling.gov.in',
         'Referer': 'https://incometaxindiaefiling.gov.in/e-Filing/Services/KnowYourJurisdictionLink.html',
         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
         'X-Requested-With': 'XMLHttpRequest'
      }

      self.session_init_url = 'https://incometaxindiaefiling.gov.in/e-Filing/Services/KnowYourJurisdictionLink.html'
      self.captcha_url = "https://incometaxindiaefiling.gov.in/e-Filing/CreateCaptcha.do"
      self.data_url = "https://incometaxindiaefiling.gov.in/e-Filing/Services/KnowYourJurisdiction.html"

      self.session = None
      self.captcha = ''
      self.request_id = ''

   def get_session(self):
      if not self.session:
         self.session = requests.session()
      return self.session

   def get_pan_info(self, pan_no):
      if not self.captcha:
         raise "Set Captcha First"

      session = self.get_session()

      content = session.post(self.data_url, data={
         'requestId': self.request_id,
         'panOfDeductee': pan_no,
         'captchaCode': self.captcha
      }, headers=self.headers, verify=False).text

      rs = IncomeTaxPanPortal.__parse__(content)
      return rs

   def init_session(self):
      session = self.get_session()

      response = session.get(self.session_init_url, verify=False).text
      soup = BeautifulSoup(response, 'html.parser')
      self.request_id = soup.find(id='KnowYourJurisdiction_requestId')['value']

      response = session.get(self.captcha_url, headers=self.headers, verify=False, stream=True)
      file_path = '../cap/{}.png'.format(self.request_id)
      with open(file_path, 'wb') as out_file:
         shutil.copyfileobj(response.raw, out_file)
      return '{}.png'.format(self.request_id)

   def set_captcha(self, captcha):
      self.captcha = captcha

   def dump_session(self):
      session = self.get_session()
      s_obj = {
         'session': requests.utils.dict_from_cookiejar(session.cookies),
         'request_id': self.request_id
      }
      session_pickle = pickle.dumps(s_obj)
      return base64.b64encode(session_pickle)

   def load_session(self, session_string):
      session = self.get_session()
      s_obj = pickle.loads(base64.b64decode(session_string))
      session.cookies = requests.utils.cookiejar_from_dict(s_obj['session'])
      self.request_id = s_obj['request_id']

   @classmethod
   def __parse__(cls, html_data):
      # print html_data
      soup = BeautifulSoup(html_data, 'html.parser')
      rows = [row.findAll('td') for row in soup.find(id='staticContentsUrl').findAll('tr')]
      return {row[0].text: row[1].text for row in rows if row}
