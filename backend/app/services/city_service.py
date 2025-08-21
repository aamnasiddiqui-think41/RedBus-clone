from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.schemas.city import CityResponse
from app.db.models.city import City

class CityService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_all_cities(self) -> List[Dict[str, Any]]:
        """
        Get all available cities from the database
        """
        try:
            cities = self.db.query(City).all()
            return [
                {
                    "id": str(city.id),
                    "name": city.name
                }
                for city in cities
            ]
        except Exception as e:
            print(f"Error fetching cities: {e}")
            # Fallback to empty list if database query fails
            return []
