package org.cencora.adminapproval.util;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

public class JwtKeyGenerator {
    
    public static void main(String[] args) {
        try {
            generateKeys();
            System.out.println("JWT keys generated successfully!");
            System.out.println("Private key: src/main/resources/privateKey.pem");
            System.out.println("Public key: src/main/resources/publicKey.pem");
        } catch (Exception e) {
            System.err.println("Error generating keys: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public static void generateKeys() throws NoSuchAlgorithmException, IOException {
        // Generate RSA key pair
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        
        RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
        RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
        
        // Convert to PEM format
        String privateKeyPem = convertToPEM(privateKey.getEncoded(), "RSA PRIVATE KEY");
        String publicKeyPem = convertToPEM(publicKey.getEncoded(), "PUBLIC KEY");
        
        // Ensure directory exists
        Files.createDirectories(Paths.get("src/main/resources"));
        
        // Write private key
        try (FileWriter writer = new FileWriter("src/main/resources/privateKey.pem")) {
            writer.write(privateKeyPem);
        }
        
        // Write public key
        try (FileWriter writer = new FileWriter("src/main/resources/publicKey.pem")) {
            writer.write(publicKeyPem);
        }
    }
    
    private static String convertToPEM(byte[] keyBytes, String keyType) {
        String base64Key = Base64.getEncoder().encodeToString(keyBytes);
        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN ").append(keyType).append("-----\n");
        
        // Split into 64 character lines
        for (int i = 0; i < base64Key.length(); i += 64) {
            int end = Math.min(i + 64, base64Key.length());
            pem.append(base64Key.substring(i, end)).append("\n");
        }
        
        pem.append("-----END ").append(keyType).append("-----\n");
        return pem.toString();
    }
}
