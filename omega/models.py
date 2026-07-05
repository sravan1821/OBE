from django.db import models
from django.contrib.auth.models import User
from vertex.models import Department

class Faculty(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"
