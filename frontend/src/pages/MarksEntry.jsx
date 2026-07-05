import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataStore } from '../lib/data';
import { MarksUtils } from '../lib/marks_utils';
import { Save, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MarksEntry() {
  const { user, role } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    // If it's a specific faculty, get their subjects.
    // If it's HOD/Coordinator/Management, they might view all subjects (demo mode)
    const allSubjects = DataStore.getSubjects();
    if (role === 'faculty') {
      setSubjects(allSubjects.filter(s => s.facultyId === user.id));
    } else {
      setSubjects(allSubjects);
    }
  }, [user, role]);

  useEffect(() => {
    if (selectedSubject) {
      const sub = subjects.find(s => s.id === selectedSubject);
      if (sub) {
        const stus = DataStore.getStudentsByDepartment(sub.departmentId);
        setStudents(stus);
        
        // Load existing marks
        const existingMarks = DataStore.getMarksBySubject(selectedSubject) || {};
        
        // Initialize state for each student if not exists
        const initialMarksState = {};
        stus.forEach(s => {
          initialMarksState[s.id] = existingMarks[s.id] || { mid1: {}, mid2: {} };
        });
        setMarks(initialMarksState);
      }
    } else {
      setStudents([]);
    }
  }, [selectedSubject, subjects]);

  const handleMarkChange = (studentId, midId, field, value) => {
    const val = value === '' ? null : Number(value);
    setMarks(prev => {
      const newMarks = { ...prev };
      if (!newMarks[studentId]) newMarks[studentId] = { mid1: {}, mid2: {} };
      if (!newMarks[studentId][midId]) newMarks[studentId][midId] = {};
      
      newMarks[studentId][midId][field] = val;
      return newMarks;
    });
  };

  const handleSave = () => {
    if (role === 'management') {
      alert("Management does not have permission to edit marks.");
      return;
    }
    DataStore.saveBulkMarks(selectedSubject, marks);
    alert('Marks saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-md border-t-4 border-mic-red shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-mic-navy">Marks Entry Panel</h2>
          <p className="text-slate-500">Calculate OBE metrics strictly via 'Best 3 of 6' logic.</p>
        </div>
        
        <select 
          className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-md focus:ring-mic-blue"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">-- Select Subject --</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
          ))}
        </select>
      </div>

      {role === 'management' && (
        <div className="bg-red-50 border-l-4 border-mic-red p-4 rounded-md flex items-center gap-3">
          <AlertCircle className="text-mic-red" />
          <p className="text-mic-red font-semibold">Management View: You have read-only access. Mark editing is disabled.</p>
        </div>
      )}

      {selectedSubject && students.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-md shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-mic-navy uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-slate-100 z-10 border-r border-slate-200">Roll No</th>
                <th className="px-4 py-3 border-r border-slate-200">Student Name</th>
                <th className="px-4 py-3 text-center" colSpan="8">MID 1 (Descriptive Q1-Q6, UT, Asgn)</th>
                <th className="px-4 py-3 text-center bg-slate-200 border-r border-slate-300">MID 1 Total</th>
                <th className="px-4 py-3 text-center" colSpan="8">MID 2 (Descriptive Q1-Q6, UT, Asgn)</th>
                <th className="px-4 py-3 text-center bg-slate-200 border-r border-slate-300">MID 2 Total</th>
                <th className="px-4 py-3 text-center bg-mic-navy text-white">Final Internal</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const stuMarks = marks[student.id] || { mid1: {}, mid2: {} };
                const m1 = MarksUtils.calcMid(stuMarks.mid1);
                const m2 = MarksUtils.calcMid(stuMarks.mid2);
                const final = MarksUtils.calcFinal(m1, m2);

                const renderInputs = (midId) => {
                  const fields = ['q1','q2','q3','q4','q5','q6','unitTest','assignment'];
                  return fields.map(f => (
                    <td key={f} className="p-2 border-r border-slate-100 text-center">
                      <input 
                        type="number"
                        className="w-12 px-1 py-1 text-center border rounded border-slate-300 focus:border-mic-blue"
                        value={stuMarks[midId]?.[f] || ''}
                        onChange={(e) => handleMarkChange(student.id, midId, f, e.target.value)}
                        disabled={role === 'management'}
                      />
                    </td>
                  ));
                };

                return (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2 sticky left-0 bg-white font-mono z-10 border-r border-slate-200">{student.rollNo}</td>
                    <td className="px-4 py-2 font-medium border-r border-slate-200">{student.name}</td>
                    
                    {renderInputs('mid1')}
                    <td className="px-4 py-2 text-center font-bold bg-slate-100 border-r border-slate-200">{m1.toFixed(1)}</td>
                    
                    {renderInputs('mid2')}
                    <td className="px-4 py-2 text-center font-bold bg-slate-100 border-r border-slate-200">{m2.toFixed(1)}</td>
                    
                    <td className="px-4 py-2 text-center font-extrabold bg-blue-50 text-mic-navy">{final.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {role !== 'management' && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-mic-red hover:bg-mic-red-dark text-white px-6 py-2 rounded-md font-bold transition-colors"
              >
                <Save size={18} />
                Save Marks Data
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
