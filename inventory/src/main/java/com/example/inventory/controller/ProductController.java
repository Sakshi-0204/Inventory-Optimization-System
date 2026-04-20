package com.example.inventory.controller;

import com.example.inventory.model.Product;
import com.example.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin
public class ProductController {

    @Autowired
    ProductRepository repo;

    @PostMapping("/add")
    public Product addProduct(@RequestBody Product p){
        return repo.save(p);
    }

    @GetMapping("/products")
    public List<Product> getAll(){
        return repo.findAll();
    }

    @DeleteMapping("/delete/{id}")
public String delete(@PathVariable int id, @RequestParam String role){

    if(role == null || !role.equals("admin")){
        return "Access Denied";
    }

    repo.deleteById(id);
    return "Deleted";
}
    @GetMapping("/search")
    public List<Product> search(@RequestParam String name){
        return repo.findByNameContainingIgnoreCase(name);
    }

    @GetMapping("/dashboard")
    public Map<String,Integer> dashboard(){
        List<Product> list = repo.findAll();

        int total = list.size();
        int low = 0, out = 0, over = 0;

        for(Product p : list){
            if(p.getQuantity() == 0) out++;
            else if(p.getQuantity() < p.getThreshold()) low++;
            else if(p.getQuantity() > p.getMaxStock()) over++;
        }

        Map<String,Integer> map = new HashMap<>();
        map.put("total", total);
        map.put("low", low);
        map.put("out", out);
        map.put("over", over);

        return map;
    }

    @GetMapping("/alerts")
    public List<Product> alerts(){
        List<Product> res = new ArrayList<>();

        for(Product p : repo.findAll()){
            if(p.getQuantity() <= p.getThreshold()){
                res.add(p);
            }
        }
        return res;
    }

    @GetMapping("/filter/{type}")
    public List<Product> filter(@PathVariable String type){
        List<Product> res = new ArrayList<>();

        for(Product p : repo.findAll()){
            if(type.equals("low") && p.getQuantity() < p.getThreshold())
                res.add(p);

            if(type.equals("out") && p.getQuantity() == 0)
                res.add(p);

            if(type.equals("over") && p.getQuantity() > p.getMaxStock())
                res.add(p);
        }
        return res;
    }

    @GetMapping("/sort")
    public List<Product> sort(){
        List<Product> list = repo.findAll();
        list.sort((a,b)->a.getQuantity() - b.getQuantity());
        return list;
    }
}