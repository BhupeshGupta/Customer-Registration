from bottle import route,run
import bottle



@route('/google')
def index():
    return bottle.HTTPResponse(body="hello",
                               headers=[('Content-Disposition', 'attachment; filename="qwerty.txt"'),
                                        ('Content-type', 'application/txt'),
                                        ('Server', 'WSGIServer/0.1 Python/2.7.11+'),
                                        ('Access-Control-Allow-Credentials', 'true'),
                                        ('Access-Control-Allow-Headers',
                                         'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type'),
                                        ('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'),
                                        ('Access-Control-Allow-Origin', '*')])




if __name__ == "__main__":
    run(host="0.0.0.0", port=9006)
