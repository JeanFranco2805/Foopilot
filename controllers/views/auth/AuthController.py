from flask import Blueprint, render_template, redirect, url_for, session, flash

authController = Blueprint('auth', __name__, template_folder="../../templates/welcome/auth")


@authController.route("/registered")
def registered():
    return redirect(url_for('Login'))


@authController.route('/login')
def Login():
    return render_template('welcome/auth/Login.html')


@authController.route("/signup")
def SignUp():
    return render_template('welcome/auth/SignUp.html')

@authController.route("/logout", methods=["POST"])
def Logout():
    session.clear()
    flash("Has cerrado sesión exitosamente.", "success")
    return redirect(url_for('auth.Login'))