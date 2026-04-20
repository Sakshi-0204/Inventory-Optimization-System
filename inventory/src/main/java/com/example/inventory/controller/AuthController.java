package com.example.inventory.controller;

import com.example.inventory.model.User;
import com.example.inventory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    UserRepository userRepo;

    @PostMapping("/register")
public String register(@RequestBody User user) {

    if(userRepo.findByUsername(user.getUsername()) != null){
        return "User already exists";
    }

    // 🔥 IMPORTANT FIX
    if(user.getRole() == null || user.getRole().isEmpty()){
        user.setRole("manager");   // default role
    }

    userRepo.save(user);
    return "Registered Successfully";
}

   @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody User user) {

    User u = userRepo.findByUsername(user.getUsername());

    if(u != null && u.getPassword().equals(user.getPassword())){
        return ResponseEntity.ok(u);   // success
    }

    return ResponseEntity.status(401).body("Invalid credentials"); // fail
}
}