package iuh.fit.demo_driven.config;

import iuh.fit.demo_driven.model.User;
import iuh.fit.demo_driven.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Kiểm tra xem đã có tài khoản admin chưa
            if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
                User admin = new User(
                        "admin@gmail.com",
                        passwordEncoder.encode("admin123"),
                        "Administrator",
                        "ADMIN"
                );
                userRepository.save(admin);
                System.out.println(">>> Created default admin account: admin@gmail.com / admin123");
            } else {
                System.out.println(">>> Admin account already exists.");
            }
        };
    }
}
