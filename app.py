from flask import Flask, render_template
from controllers.views.auth.AuthController import authController
from controllers.views.home.HomeController import home

app = Flask(__name__, template_folder='templates')
app.register_blueprint(authController, url_prefix='/auth')
app.register_blueprint(home, url_prefix='/home')


@app.route('/')
def Dashboard():
    return render_template('welcome/Dashboard.html')


if __name__ == '__main__':
    app.run(port=2413)
