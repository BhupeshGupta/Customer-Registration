import requests
import uuid
import os
import ast
import json

config = {}
with open('config.json', 'r') as config_file:
    config = json.loads(config_file.read())

class AlfrescoApi(object):
    def __init__(self):
        self.image_path=None



    def set_login(self,username,password,host):
        self.user = username
        self.password = password
        self.url = host
        return " parameters set"


    def save_to_disk(self,upload):
        name, ext = os.path.splitext(upload.filename)
        if ext not in ('.png', '.jpg', '.jpeg'):
            return 'File extension not allowed.'
        self.image_path = "/tmp/{}".format(uuid.uuid4())
        upload.save(self.image_path)
        return ext


    def Data_manipulation(self, data):
        print "data manipulation"
        number = data['number']

        if data['doctype'] == 'pan':
            return 'pan','pan', number
        if data['doctype'] == 'tin':
            return 'tin','tin', number
        if data['doctype'] == 'excise':
            return 'excise','excise', number
        if data['doctype'] == 'service_tax':
            return 'service_tax','service_tax', number



    def upload_image(self,prefix,alfresco_model,number,ext):
        alfersco_properties =  {
                    'contenttype': '{}:{}'.format(prefix, alfresco_model),
                    'siteid': config['ALFRESCO_SITEID'],
                    'containerid': config['ALFRESCO_CONTAINERID']
                }
        req = requests.post(
            '{}/alfresco/service/api/upload'.format(self.url),
            auth=(self.user, self.password),
            files=[
                ('filedata',('{}_{}.{}'.format(prefix,number,ext) , open(self.image_path, 'rb')))
            ],
            data=alfersco_properties
        )
        if req.status_code != 200:
            print req.content
            raise Exception('Alfresco upload returned {}'.format(req.status_code))

        print req
        req = req.json()
        return req

    def update_properties(self, data, node_ref):
        print node_ref
        url = '{}/alfresco/service/api/metadata/node/{}'.format(
            self.url,
            '/'.join(self.parse_node_ref(node_ref))
        )
        req = requests.post(
            url,
            auth=(self.user, self.password),
            json=data
        )
        if req.status_code != 200:
            print req.content
            raise Exception('Alfresco property update returned {}'.format(req.status_code))
        return req.json()

    @staticmethod
    def parse_node_ref(node_ref):
        storage_type, _ = node_ref.split('://')
        storage_id, file_id = _.split('/')
        return storage_type, storage_id, file_id

    def main(self, data):
        self.set_login(config['ALFRESCO_DB_USER'], config['ALFRESCO_DB_PASS'], config['ALFRESCO_DB_HOST'])
        for image in data["image_path"]:
            self.image_path = "{}".format(image)
            ext = image.split(".")[1]
            del data["image_path"]
            prefix, alfresco_model, number =  self.Data_manipulation(data)
            print prefix, alfresco_model, number
            upload = self.upload_image(prefix, alfresco_model, number, ext)
            update_properties = self.update_properties({
                "properties": {
                    '{}:{}'.format(prefix, key.replace(' ','-').replace('(','-').replace(')','-').replace('/','-')): value for key, value in data.iteritems() if value
                    }
                },
                upload['nodeRef']
            )
            print "completed"
            return upload
