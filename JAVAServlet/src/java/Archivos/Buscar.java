package Archivos;

import java.sql.Connection;  
import java.sql.DriverManager;  
import java.sql.PreparedStatement;  
import java.sql.ResultSet;  
import java.sql.SQLException;  
  
public class Buscar {  
    public static Usuario2 validate(String email) {          
        Usuario2 u = null;
        Connection conn = null;  
        PreparedStatement pst = null;  
        ResultSet rs = null;  
        
        String url = "jdbc:mysql://localhost/";  
        String dbName = "JoinChat";  
        String driver = "com.mysql.jdbc.Driver";  
        String userName = "root";  
        String password = "2403"; 

        try {  
            Class.forName(driver).newInstance();  
            conn = DriverManager.getConnection(url + dbName, userName, password);  
  
            pst = conn.prepareStatement("select usuario from Usuarios where email=?");  
            pst.setString(1, email);    
  
            rs = pst.executeQuery();
            
            if (rs.next()) {  
                String usuario = rs.getString("usuario");
                u=new Usuario2(usuario);
            
            }
        } catch (Exception e) {  
            System.out.println(e);  
        } finally {  
            if (conn != null) {  
                try {  
                    conn.close();  
                } catch (SQLException e) {  
                    e.printStackTrace();  
                }  
            }  
            if (pst != null) {  
                try {  
                    pst.close();  
                } catch (SQLException e) {  
                    e.printStackTrace();  
                }  
            }  
            if (rs != null) {  
                try {  
                    rs.close();  
                } catch (SQLException e) {  
                    e.printStackTrace();  
                }  
            }  
        }  
        return u;  
    }  
}  