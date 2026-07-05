from django.db import models
from vertex.models import Department
from omega.models import Faculty

class Subject(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    semester = models.IntegerField()
    credits = models.IntegerField()
    faculty = models.ForeignKey(Faculty, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Student(models.Model):
    name = models.CharField(max_length=255)
    roll_no = models.CharField(max_length=50, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    semester = models.IntegerField()
    
    def __str__(self):
        return f"{self.roll_no} - {self.name}"
