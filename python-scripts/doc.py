import requests
import json
import requests
import shutil
import uuid
import os
from io import StringIO, BytesIO

with open('config.json','r+') as config_file:
    config = json.loads(config_file.read())





class AlfrescoRestApi(object):
    def __init__(self, user, password, url):
        self.user = user
        self.password = password
        self.url = url
        self.ticket = None
        print self.user

    def upload(self, file_path, file_name, alfersco_properties):
        req = requests.post(
            '{}/alfresco/service/api/upload'.format(self.url),
            auth=(self.user, self.password),
            files=[
                ('filedata', (file_name, open(file_path, 'rb')))
            ],
            data=alfersco_properties
        )

        if req.status_code != 200:
            print req.content
            raise Exception('Alfresco upload returned {}'.format(req.status_code))

        req = req.json()
        print req
        return req

    def prepare_everything(self):
        print "hello"







alfresco = AlfrescoRestApi(config['ALFRESCO_DB_USER'], config['ALFRESCO_DB_PASS'], config['ALFRESCO_DB_HOST'])

