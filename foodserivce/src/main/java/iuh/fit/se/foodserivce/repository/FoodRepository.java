package iuh.fit.se.foodserivce.repository;

import iuh.fit.se.foodserivce.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodRepository extends JpaRepository<Food, Integer> {
}
