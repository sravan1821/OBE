from django.db import models
from nexus.models import Subject, Student
from omega.models import Faculty

class Marks(models.Model):
    MID_CHOICES = [
        (1, 'Mid 1'),
        (2, 'Mid 2'),
    ]
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    mid_term = models.IntegerField(choices=MID_CHOICES)
    q1 = models.FloatField(null=True, blank=True)
    q2 = models.FloatField(null=True, blank=True)
    q3 = models.FloatField(null=True, blank=True)
    q4 = models.FloatField(null=True, blank=True)
    q5 = models.FloatField(null=True, blank=True)
    q6 = models.FloatField(null=True, blank=True)
    unit_test = models.FloatField(null=True, blank=True)
    assignment = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('subject', 'student', 'mid_term')

class Timetable(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    day = models.CharField(max_length=20)
    period = models.CharField(max_length=20)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('day', 'period', 'faculty')
