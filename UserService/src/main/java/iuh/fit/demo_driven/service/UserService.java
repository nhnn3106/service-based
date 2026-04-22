package iuh.fit.demo_driven.service;

import iuh.fit.demo_driven.dto.AuthResponse;
import iuh.fit.demo_driven.dto.UserLoginRequest;
import iuh.fit.demo_driven.dto.UserRegisterRequest;
import iuh.fit.demo_driven.dto.UserResponse;
import iuh.fit.demo_driven.model.User;
import iuh.fit.demo_driven.repository.UserRepository;
import iuh.fit.demo_driven.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public UserResponse register(UserRegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("email.exists");
        }
        String encoded = passwordEncoder.encode(req.getPassword());
        User u = new User(req.getEmail(), encoded, req.getName(), "USER");
        User saved = userRepository.save(u);
        return toDto(saved);
    }

    public AuthResponse login(UserLoginRequest req) {
        User u = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("invalid.credentials"));
        if (!passwordEncoder.matches(req.getPassword(), u.getPassword())) {
            throw new IllegalArgumentException("invalid.credentials");
        }
        String token = jwtUtil.generateToken(u.getId(), u.getEmail(), u.getRole());
        Instant expiresAt = Instant.now().plusMillis(jwtUtil.getExpirationMs());
        return new AuthResponse(token, expiresAt, toDto(u));
    }

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return toDto(user);
    }

    private UserResponse toDto(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getName(), u.getRole(), u.getCreatedAt());
    }
}
