package org.cencora.adminapproval.service;

import jakarta.enterprise.context.ApplicationScoped;
import org.mindrot.jbcrypt.BCrypt;

@ApplicationScoped
public class PasswordService {
    
    private static final int BCRYPT_ROUNDS = 12;
    
    public String hashPassword(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(BCRYPT_ROUNDS));
    }
    
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }
}
