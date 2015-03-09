package Servlet;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import Archivos.Login;
import Archivos.Usuario1;
import org.json.simple.*;

public class LoginServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    public void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        String n = request.getParameter("username");
        String p = request.getParameter("userpass");

        Usuario1 u = Login.validate(n, p);
        if (u!=null) {
            String format = request.getParameter("format");
            
            if (format.equals("json")) {
                JSONObject json = new JSONObject();
                json.put("success", true);
                JSONObject user = new JSONObject();
                user.put("usuario", u.getUsuario());
                user.put("password", u.getPassword());
                user.put("nickname",u.getNickname());
                user.put("email", u.getEmail());
                user.put("status",u.getStatus());
                json.put("user", user);
                
                out.print(json);
            }
        } else {
            String format = request.getParameter("format");
            if (format.equals("json")) {
                JSONObject json = new JSONObject();
                json.put("success", false);
                out.print(json);
               
                
            }

        }

        out.close();
    }
}
