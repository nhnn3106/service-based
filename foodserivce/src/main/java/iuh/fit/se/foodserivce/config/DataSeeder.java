package iuh.fit.se.foodserivce.config;

import iuh.fit.se.foodserivce.entity.Food;
import iuh.fit.se.foodserivce.repository.FoodRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedFoods(FoodRepository foodRepository) {
        return args -> {
            if (foodRepository.count() == 0) {
                foodRepository.saveAll(List.of(
                        new Food("Com tam", new BigDecimal("35000.00"), "Vietnamese broken rice with grilled pork"),
                        new Food("Pho bo", new BigDecimal("45000.00"), "Beef noodle soup"),
                        new Food("Banh mi", new BigDecimal("20000.00"), "Vietnamese baguette sandwich"),
                        new Food("Tra dao", new BigDecimal("25000.00"), null)
                ));
            }
        };
    }
}
