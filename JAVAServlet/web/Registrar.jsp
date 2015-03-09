<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Registrar</title>  
</head>  
<body>  
    <form action="RegistroServlet" method="post">  
        <fieldset style="width: 300px">  
            <legend>REGISTRO: </legend>  
            <table>  
                <tr>  
                    <td>Nombre:</td>  
                    <td><input type="text" name="username" required="required" /></td>  
                </tr>  
                <tr>  
                    <td>Contraseña:</td>  
                    <td><input type="text" name="userpass" required="required" /></td>  
                </tr>
                <tr>  
                    <td>Nickname:</td>  
                    <td><input type="text" name="nickname" required="required" /></td>  
                </tr>
                <tr>  
                    <td>Email:</td>  
                    <td><input type="text" name="email" required="required" /></td>  
                </tr>  
                <tr>  
                    <td><input type="submit" value="ACEPTAR" /></td>  
                </tr>  
            </table>  
        </fieldset>  
    </form>  
</body>  
</html>
