package iuh.fit.se.foodserivce.service;

import iuh.fit.se.foodserivce.entity.Food;
import iuh.fit.se.foodserivce.repository.FoodRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodService {

    private final FoodRepository foodRepository;

    public FoodService(FoodRepository foodRepository) {
        this.foodRepository = foodRepository;
    }

    public List<Food> getAllFoods() {
        return foodRepository.findAll();
    }

    public Food getFoodById(Integer id) {
        return foodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food not found with id: " + id));
    }

    public Food createFood(Food food) {
        food.setId(null);
        return foodRepository.save(food);
    }

    public Food updateFood(Integer id, Food request) {
        Food current = foodRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Food not found with id: " + id));

        current.setName(request.getName());
        current.setPrice(request.getPrice());
        current.setDescription(request.getDescription());

        return foodRepository.save(current);
    }

    public void deleteFood(Integer id) {
        if (!foodRepository.existsById(id)) {
            throw new IllegalArgumentException("Food not found with id: " + id);
        }
        foodRepository.deleteById(id);
    }
}
