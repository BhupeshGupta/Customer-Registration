import requests
from bs4 import BeautifulSoup
import shutil
import json
import base64
import pickle

class CbecEasiestPortal:
   ACTIVE = 'ACTIVE'
   INVALID = 'INVALID'

   def __init__(self):
      self.headers = {
         # Accept all
         'Accept': '*/*',
         # Disable Gzip
         'Accept-Encoding': '',
         'Connection': 'keep-alive',
         'Host': 'cbec-easiest.gov.in',
         'Referer': 'https://cbec-easiest.gov.in/EST/AssesseeVerification.do',
         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36'
      }

      self.data_url = "https://cbec-easiest.gov.in/EST/AssesseeVerificationResult.do"
      self.captcha_url = "https://cbec-easiest.gov.in/EST/CaptchaFeedback"

      self.session = None
      self.captcha = ''

   def get_session(self):
      if not self.session:
         self.session = requests.session()
      return self.session

   def get_excise_info(self, excise_no):
      if not self.captcha:
         raise "Set Captcha First"

      session = self.get_session()

      content = session.post(self.data_url, data={
         '': '',
         'ask': 'getECCDetails',
         'submit': 'Get Details',
         'captchaText': self.captcha,
         'assesseeCode': excise_no

      }, headers=self.headers, verify=False).text

      success = ('validation error' not in content.lower())
      if success:
         rs = CbecEasiestPortal.__parse__(content)
         rs.update({'excise_no': excise_no})
         return rs

      return {'error': 'Unable to fetch data'}

   def get_service_info(self, service_tax):
      if not self.captcha:
         raise "Set Captcha First"

      session = self.get_session()

      content = session.post(self.data_url, data={
         '': '',
         'ask': 'getECCDetails',
         'submit': 'Get Details',
         'captchaText': self.captcha,
         'assesseeCode': service_tax

      }, headers=self.headers, verify=False).text
      print content
      success = ('validation error' not in content.lower())
      if success:
         rs = CbecEasiestPortal.__parse__(content)
         rs.update({'service_tax': service_tax})
         return rs

      return {'error': 'Unable to fetch data'}


   def init_session(self):
      session = self.get_session()
      response = session.get(self.captcha_url, headers=self.headers, verify=False, stream=True)
      with open('/tmp/excise.png', 'wb') as out_file:
         shutil.copyfileobj(response.raw, out_file)
      return 'excise.png'

   def set_captcha(self, captcha):
      self.captcha = captcha
      print self.captcha

   def dump_session(self):
      session = self.get_session()
      s_obj = {
         'session': requests.utils.dict_from_cookiejar(session.cookies),
      }
      session_pickle = pickle.dumps(s_obj)
      return base64.b64encode(session_pickle)

   def load_session(self, session_string):
      session = self.get_session()
      s_obj = pickle.loads(base64.b64decode(session_string))
      session.cookies = requests.utils.cookiejar_from_dict(s_obj['session'])



   @classmethod
   def check_status(cls, data):
      if 'ECCDetailsValid' in data:
         if data['ECCDetailsValid'] == 'ACTIVE':
            return CbecEasiestPortal.ACTIVE
         if data['ECCDetailsValid'] == 'No records available for given Assessee Code':
            return CbecEasiestPortal.INVALID
      raise 'Unknown Excise Status'

   @classmethod
   def __parse__(cls, html_data):
      soup = BeautifulSoup(html_data, 'html.parser')
      spans = soup.findAll('span')
      rs = {}
      for span in spans:
         rs[span['id'].strip()] = span.text.strip().replace('\n', '').replace('\t', '').replace('\r', '')
      return rs
