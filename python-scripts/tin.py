import requests
from bs4 import BeautifulSoup
from bottle import get, post, request, run
import shutil
import json
import pickle
from requests.auth import HTTPBasicAuth

class tin_verification:

    def __init__(self):
        self.tin_html = None
        self.punjab_html= None
        self.tin= ''


    def get_data(self):
        headers = {
                'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding':'gzip, deflate, sdch, br',
                'Accept-Language':'en-GB,en-US;q=0.8,en;q=0.6',
                'Connection':'keep-alive',
                'Host':'www.tinxsys.com',
                'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36'
        }
        payload={'tinNumber': self.tin,'searchBy': 'TIN'}
        data = requests.get('https://www.tinxsys.com/TinxsysInternetWeb/dealerControllerServlet', params=payload, headers=headers)
        self.html = data.text


    def scrap_data(self):
        def santise(value):
            return value\
                .replace("\r\n", " ")\
                .replace(u"\xa0", " ")\
                .strip()

        soup = BeautifulSoup(self.html, 'html.parser')
        for x in soup.findAll('div',{'align':'center'}):
            if cmp('Dealer Not Found for the entered TIN', x.text)== 0:
                return 0
        keys = soup.findAll('td', { "class" : "tdGrey" })
        values = soup.findAll('td', { "class": "tdWhite" })
        return {
            santise(key.text): santise(values[index].text) \
               for index, key in enumerate(keys)
            }

    def pex_tax(self):
        session = requests.Session()

        parameters = {'_nfpb':'true', '_pageLabel':'PunjabExcise_portal_page_84' }
        session.get('https://www.pextax.com/PEXWAR/appmanager/pexportal/PunjabExcise', params= parameters)

        payload = {'_nfpb':'true','_windowLabel':'DealerSearchController_1_1','DealerSearchController_1_1_actionOverride':'/com/pex/portal/DealerSearch/controller/begin'}
        data = {'DealerSearchController_1_1{actionForm.reg}':self.tin,'DealerSearchController_1_1actionOverride:search':'Search'}
        req = session.post('https://www.pextax.com/PEXWAR/appmanager/pexportal/PunjabExcise',params = payload, data = data)
        self.punjab_html= req.text

        soup = BeautifulSoup(self.punjab_html, 'html.parser')
        for x in soup.findAll('h1'):
            if cmp('Nothing To Display', x.text)== 0:
                return False

        keys = [x.text for x in soup.findAll("tr", {'class': 'headrow'})[0].findAll('td')]
        values = [x.text for x in soup.findAll('td', {'style': 'word-wrap: break-word'})]

        return {
            key: values[index] \
            for index, key in enumerate(keys)
        }


def verify_tin(tin_number):
    portal  = tin_verification()
    portal.tin = tin_number
    print portal.tin
    pex_result = portal.pex_tax()
    if pex_result:
        return pex_result
    print "Not found in punjab pextax . searching pentax"
    portal.get_data()
    return portal.scrap_data()
