package com.example.inventory;

import com.example.inventory.model.User;
import com.example.inventory.repository.UserRepository;
import org.springframework.boot.*;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class InventoryApplication {

    public static void main(String[] args) {
        SpringApplication.run(InventoryApplication.class, args);
    }

    @Bean
    CommandLineRunner init(UserRepository repo){
        return args -> {

            if(repo.findByUsername("admin") == null){
                User a = new User();
                a.setUsername("admin");
                a.setPassword("123");
                a.setRole("admin");
                repo.save(a);
            }

            if(repo.findByUsername("manager") == null){
                User m = new User();
                m.setUsername("manager");
                m.setPassword("123");
                m.setRole("manager");
                repo.save(m);
            }
        };
    }
}