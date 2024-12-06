from flask import Blueprint, render_template

authController = Blueprint('auth', __name__, template_folder="../../templates/welcome/auth")


@authController.route('/login')
def Login():
    return render_template('welcome/auth/Login.html')


@authController.route("/signup")
def SignUp():
    return render_template('welcome/auth/SignUp.html')
