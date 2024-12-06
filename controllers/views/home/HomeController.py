from flask import Blueprint, render_template

home = Blueprint("home", __name__, template_folder="../../templates/welcome/home")


@home.route("/")
def Home():
    return render_template('welcome/home/Home.html')


#Manejo de los formularios

@home.route("/employee/product")
def addProduct():
    return render_template('welcome/home/forms/ProductsToMenu.html')
