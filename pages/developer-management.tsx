import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const texts = {
  zh: {
    title: '开发者管理',
    addDeveloper: '添加开发者',
    name: '姓名',
    nameEn: '英文姓名',
    role: '角色',
    hourlyRate: '时薪 (元/小时)',
    speedFactor: '速度倍率',
    availableHours: '可用工时 (四周每周小时数)',
    skills: '技能标签',
    skillsPlaceholder: '例如：React, Node.js, UI设计',
    submit: '添加开发者',
    cancel: '取消',
    back: '返回',
    lang: 'English',
    success: '开发者添加成功！',
    error: '添加失败，请重试',
    nameRequired: '请输入姓名',
    roleRequired: '请选择角色',
    rateRequired: '请输入时薪',
    speedRequired: '请输入速度倍率',
    hoursRequired: '请输入可用工时',
    loading: '添加中...',
    developerList: '开发者列表',
    noDevelopers: '暂无开发者',
    delete: '删除',
    deleteConfirm: '确认删除该开发者？',
    edit: '编辑',
    update: '更新',
    updateSuccess: '开发者信息更新成功！',
    updateError: '更新失败，请重试',
    confirm: '确认',
    search: '搜索',
    clearSearch: '清除搜索',
    noResults: '没有找到匹配的开发者',
  },
  en: {
    title: 'Developer Management',
    addDeveloper: 'Add Developer',
    name: 'Name',
    nameEn: 'English Name',
    role: 'Role',
    hourlyRate: 'Hourly Rate (¥/hour)',
    speedFactor: 'Speed Factor',
    availableHours: 'Available Hours (4 weeks)',
    skills: 'Skills',
    skillsPlaceholder: 'e.g. React, Node.js, UI Design',
    submit: 'Add Developer',
    cancel: 'Cancel',
    back: 'Back',
    lang: '中文',
    success: 'Developer added successfully!',
    error: 'Failed to add developer, please try again',
    nameRequired: 'Please enter name',
    roleRequired: 'Please select role',
    rateRequired: 'Please enter hourly rate',
    speedRequired: 'Please enter speed factor',
    hoursRequired: 'Please enter available hours',
    loading: 'Adding...',
    developerList: 'Developer List',
    noDevelopers: 'No developers',
    delete: 'Delete',
    deleteConfirm: 'Are you sure to delete this developer?',
    edit: 'Edit',
    update: 'Update',
    updateSuccess: 'Developer information updated successfully!',
    updateError: 'Update failed, please try again',
    confirm: 'Confirm',
    search: 'Search',
    clearSearch: 'Clear search',
    noResults: 'No matching developers found',
  },
};

const roles = {
  zh: [
    '前端工程师',
    '后端工程师',
    'UI设计师',
    'UX设计师',
    '测试工程师',
    '数据库工程师',
    '产品经理',
    'DevOps工程师',
    '全栈工程师',
    '杂项专员'
  ],
  en: [
    'Frontend Engineer',
    'Backend Engineer',
    'UI Designer',
    'UX Designer',
    'Test Engineer',
    'Database Engineer',
    'Product Manager',
    'DevOps Engineer',
    'Full Stack Engineer',
    'General Specialist'
  ]
};

export default function DeveloperManagement() {
  const router = useRouter();
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = texts[lang];
  const [developers, setDevelopers] = useState<any[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    role: '',
    hourly_rate: '',
    speed_factor: '',
    week1_hours: '',
    week2_hours: '',
    week3_hours: '',
    week4_hours: '',
    skills: ''
  });

  // 获取开发者列表
  const fetchDevelopers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setDevelopers(data.members || []);
    } catch (error) {
      console.error('Fetch developers error:', error);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  // 搜索逻辑
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDevelopers(developers);
    } else {
      const filtered = developers.filter(developer => {
        const searchLower = searchTerm.toLowerCase();
        return (
          developer.name?.toLowerCase().includes(searchLower) ||
          developer.name_en?.toLowerCase().includes(searchLower) ||
          developer.role?.toLowerCase().includes(searchLower) ||
          developer.skills?.some((skill: string) => skill.toLowerCase().includes(searchLower)) ||
          developer.hourly_rate?.toString().includes(searchTerm) ||
          developer.speed_factor?.toString().includes(searchTerm)
        );
      });
      setFilteredDevelopers(filtered);
    }
  }, [searchTerm, developers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!formData.name.trim()) {
      setSuccessMessage(t.nameRequired);
      setIsSuccess(false);
      setShowSuccessMessage(true);
      return;
    }
    if (!formData.role) {
      setSuccessMessage(t.roleRequired);
      setIsSuccess(false);
      setShowSuccessMessage(true);
      return;
    }
    if (!formData.hourly_rate) {
      setSuccessMessage(t.rateRequired);
      setIsSuccess(false);
      setShowSuccessMessage(true);
      return;
    }
    if (!formData.speed_factor) {
      setSuccessMessage(t.speedRequired);
      setIsSuccess(false);
      setShowSuccessMessage(true);
      return;
    }
    if (!formData.week1_hours || !formData.week2_hours || !formData.week3_hours || !formData.week4_hours) {
      setSuccessMessage(t.hoursRequired);
      setIsSuccess(false);
      setShowSuccessMessage(true);
      return;
    }

    setLoading(true);
    try {
      // 验证每周工时
      if (!formData.week1_hours || !formData.week2_hours || !formData.week3_hours || !formData.week4_hours) {
        setSuccessMessage(lang === 'zh' ? '请填写所有四周的可用工时' : 'Please fill in available hours for all 4 weeks');
        setIsSuccess(false);
        setShowSuccessMessage(true);
        return;
      }

      // 组合可用工时字符串
      const available_hours = `${formData.week1_hours}/${formData.week2_hours}/${formData.week3_hours}/${formData.week4_hours}`;

      const submitData = {
        name: formData.name,
        name_en: formData.name_en,
        role: formData.role,
        hourly_rate: parseFloat(formData.hourly_rate),
        speed_factor: parseFloat(formData.speed_factor),
        available_hours: available_hours,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };

      const url = editingId ? `/api/members/${editingId}` : '/api/members';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        // 显示美化的成功消息
        setSuccessMessage(editingId ? t.updateSuccess : t.success);
        setIsSuccess(true);
        setShowSuccessMessage(true);
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchDevelopers();
      } else {
        throw new Error('Request failed');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSuccessMessage(editingId ? t.updateError : t.error);
      setIsSuccess(false);
      setShowSuccessMessage(true);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_en: '',
      role: '',
      hourly_rate: '',
      speed_factor: '',
      week1_hours: '',
      week2_hours: '',
      week3_hours: '',
      week4_hours: '',
      skills: ''
    });
  };

  const handleEdit = (developer: any) => {
    setEditingId(developer.id);
    
    // 解析可用工时数据
    let week1_hours = '', week2_hours = '', week3_hours = '', week4_hours = '';
    if (developer.available_hours) {
      if (Array.isArray(developer.available_hours)) {
        // 如果是数组格式
        week1_hours = developer.available_hours[0]?.toString() || '';
        week2_hours = developer.available_hours[1]?.toString() || '';
        week3_hours = developer.available_hours[2]?.toString() || '';
        week4_hours = developer.available_hours[3]?.toString() || '';
      } else {
        // 如果是字符串格式
        const hoursArray = developer.available_hours.split('/');
        if (hoursArray.length === 4) {
          week1_hours = hoursArray[0];
          week2_hours = hoursArray[1];
          week3_hours = hoursArray[2];
          week4_hours = hoursArray[3];
        }
      }
    }
    
    setFormData({
      name: developer.name || '',
      name_en: developer.name_en || '',
      role: (() => {
        // 处理角色解析
        if (Array.isArray(developer.roles) && developer.roles.length > 0) {
          return developer.roles[0];
        } else if (typeof developer.roles === 'string') {
          try {
            const parsedRoles = JSON.parse(developer.roles);
            return Array.isArray(parsedRoles) && parsedRoles.length > 0 ? parsedRoles[0] : '';
          } catch (e) {
            return developer.roles || '';
          }
        } else {
          return developer.roles || '';
        }
      })(),
      hourly_rate: developer.hourly_rate?.toString() || '',
      speed_factor: developer.speed_factor?.toString() || '',
      week1_hours: week1_hours,
      week2_hours: week2_hours,
      week3_hours: week3_hours,
      week4_hours: week4_hours,
      skills: developer.skills?.join(', ') || ''
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const res = await fetch(`/api/members/${deleteId}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        const updatedDevelopers = developers.filter(d => d.id !== deleteId);
        setDevelopers(updatedDevelopers);
        setFilteredDevelopers(filteredDevelopers.filter(d => d.id !== deleteId));
        setDeleteId(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-16 p-6" style={{ position: 'relative' }}>
      {/* 左上角首页按钮 */}
      <div style={{ position: 'fixed', left: 24, top: 24, display: 'flex', gap: 12, zIndex: 3000 }}>
        <button
          style={{
            background: '#fff',
            color: '#1890ff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            padding: '6px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            zIndex: 3001,
            cursor: 'pointer',
            letterSpacing: 2
          }}
          onClick={() => router.push('/')}
        >
          {lang === 'zh' ? '首页' : 'Home'}
        </button>
      </div>
      
      {/* 右上角语言切换 */}
      <div style={{ position: 'fixed', right: 24, top: 24, zIndex: 3000 }}>
        <button 
          className="btn" 
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
        >
          {t.lang}
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-8">{t.title}</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button
          className="btn"
          style={{ background: '#f1f5f9', color: '#222', borderRadius: 8, fontWeight: 600, padding: '8px 16px' }}
          onClick={() => router.push('/task-planner')}
        >
          {t.back}
        </button>
        
        <button
          className="btn"
          style={{ background: '#1890ff', color: '#fff', borderRadius: 8, fontWeight: 600, padding: '8px 16px' }}
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            resetForm();
          }}
        >
          {t.addDeveloper}
        </button>
      </div>

      {/* 开发者列表 */}
      <div style={{ marginBottom: 32 }}>
        <h2 className="text-xl font-semibold mb-4">{t.developerList}</h2>
        
        {/* 搜索框 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ 
            position: 'relative', 
            maxWidth: 400,
            display: 'flex',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'zh' ? '搜索开发者姓名、角色、技能...' : 'Search by name, role, skills...'}
              style={{
                width: '100%',
                padding: '12px 16px 12px 44px',
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1890ff'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <div style={{
              position: 'absolute',
              left: 16,
              color: '#999',
              fontSize: 16
            }}>
              🔍
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: 4
                }}
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <div style={{ 
              fontSize: 12, 
              color: '#666', 
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span>
                {lang === 'zh' 
                  ? `找到 ${filteredDevelopers.length} 个开发者` 
                  : `Found ${filteredDevelopers.length} developers`
                }
              </span>
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1890ff',
                  cursor: 'pointer',
                  fontSize: 12,
                  textDecoration: 'underline'
                }}
              >
                {t.clearSearch}
              </button>
            </div>
          )}
        </div>
        {filteredDevelopers.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>
            {searchTerm ? t.noResults : t.noDevelopers}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filteredDevelopers.map((developer) => (
              <div key={developer.id} style={{ 
                background: '#fff', 
                borderRadius: 12, 
                padding: 20, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 600 }}>
                        {lang === 'zh' ? developer.name : (developer.name_en || developer.name)}
                      </h3>
                      <span style={{ 
                        background: '#1890ff', 
                        color: '#fff', 
                        padding: '2px 8px', 
                        borderRadius: 4, 
                        fontSize: 12 
                      }}>
                        {(() => {
                          // 处理角色显示
                          let roleName = '';
                          if (Array.isArray(developer.roles)) {
                            roleName = developer.roles[0] || '';
                          } else if (typeof developer.roles === 'string') {
                            try {
                              const parsedRoles = JSON.parse(developer.roles);
                              roleName = Array.isArray(parsedRoles) ? parsedRoles[0] : developer.roles;
                            } catch (e) {
                              roleName = developer.roles || '';
                            }
                          } else {
                            roleName = developer.roles || '';
                          }
                          
                          // 如果角色名称为空，显示默认文本
                          if (!roleName) {
                            return lang === 'zh' ? '未知角色' : 'Unknown Role';
                          }
                          
                          // 角色名称映射
                          const roleMap = {
                            '前端工程师': 'Frontend Engineer',
                            '后端工程师': 'Backend Engineer',
                            'UI设计师': 'UI Designer',
                            'UX设计师': 'UX Designer',
                            '测试工程师': 'Test Engineer',
                            '数据库工程师': 'Database Engineer',
                            '产品经理': 'Product Manager',
                            'DevOps工程师': 'DevOps Engineer',
                            '全栈工程师': 'Full Stack Engineer',
                            '杂项专员': 'General Specialist'
                          };
                          
                          return lang === 'zh' ? roleName : (roleMap[roleName as keyof typeof roleMap] || roleName);
                        })()}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 14, color: '#666' }}>
                      <div>{lang === 'zh' ? '时薪' : 'Hourly Rate'}: ¥{developer.hourly_rate}/{lang === 'zh' ? '小时' : 'hour'}</div>
                      <div>{lang === 'zh' ? '速度倍率' : 'Speed Factor'}: {developer.speed_factor}x</div>
                      <div>{lang === 'zh' ? '可用工时' : 'Available Hours'}: {(() => {
                        // 处理可用工时显示
                        if (Array.isArray(developer.available_hours)) {
                          return developer.available_hours.join('/');
                        } else if (typeof developer.available_hours === 'string') {
                          // 如果是字符串格式，直接显示
                          return developer.available_hours;
                        } else {
                          return '40/35/30/25';
                        }
                      })()}</div>
                      {developer.skills && developer.skills.length > 0 && (
                        <div>{lang === 'zh' ? '技能' : 'Skills'}: {developer.skills.join(', ')}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn"
                      style={{ background: '#1890ff', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 14 }}
                      onClick={() => handleEdit(developer)}
                    >
                      {t.edit}
                    </button>
                    <button
                      className="btn"
                      style={{ background: '#e11d48', color: '#fff', borderRadius: 6, padding: '4px 12px', fontSize: 14 }}
                      onClick={() => setDeleteId(developer.id)}
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加/编辑表单 */}
      {showForm && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, minWidth: 480, maxWidth: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', 
            padding: 32, position: 'relative', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
              {editingId ? (lang === 'zh' ? '编辑开发者' : 'Edit Developer') : t.addDeveloper}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>{t.name} *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
                  placeholder={lang === 'zh' ? '请输入姓名' : 'Enter name'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>{t.nameEn}</label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
                  placeholder={lang === 'zh' ? '请输入英文姓名' : 'Enter English name'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>{t.role} *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
                >
                  <option value="">{lang === 'zh' ? '请选择角色' : 'Select role'}</option>
                  {roles[lang].map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>{t.hourlyRate} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
                  placeholder={lang === 'zh' ? '请输入时薪' : 'Enter hourly rate'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>{t.speedFactor} *</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.speed_factor}
                  onChange={(e) => setFormData({...formData, speed_factor: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
                  placeholder={lang === 'zh' ? '请输入速度倍率' : 'Enter speed factor'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>{t.availableHours} *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#666' }}>
                      {lang === 'zh' ? '第1周' : 'Week 1'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.week1_hours}
                      onChange={(e) => setFormData({...formData, week1_hours: e.target.value})}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
                      placeholder="40"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#666' }}>
                      {lang === 'zh' ? '第2周' : 'Week 2'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.week2_hours}
                      onChange={(e) => setFormData({...formData, week2_hours: e.target.value})}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
                      placeholder="35"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#666' }}>
                      {lang === 'zh' ? '第3周' : 'Week 3'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.week3_hours}
                      onChange={(e) => setFormData({...formData, week3_hours: e.target.value})}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: 4, fontSize: 12, color: '#666' }}>
                      {lang === 'zh' ? '第4周' : 'Week 4'}
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.week4_hours}
                      onChange={(e) => setFormData({...formData, week4_hours: e.target.value})}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb' }}
                      placeholder="25"
                    />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {lang === 'zh' ? '请填写四周每周的可用工时（小时）' : 'Please fill in available hours for each week'}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>{t.skills}</label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb' }}
                  placeholder={t.skillsPlaceholder}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  type="submit"
                  className="btn"
                  style={{ flex: 1, background: '#1890ff', color: '#fff', borderRadius: 8, padding: '12px', fontWeight: 600 }}
                  disabled={loading}
                >
                  {loading ? t.loading : (editingId ? t.update : t.submit)}
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ flex: 1, background: '#f1f5f9', color: '#222', borderRadius: 8, padding: '12px', fontWeight: 600 }}
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      {deleteId && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
          }}>
            <div style={{fontWeight:700, fontSize:22, marginBottom:18}}>{t.deleteConfirm}</div>
            <div style={{display:'flex', justifyContent:'center', gap:24}}>
              <button style={{background:'#e11d48',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={handleDelete}>{t.confirm}</button>
              <button style={{background:'#f1f5f9',color:'#222',border:'none',borderRadius:8,fontWeight:600,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={()=>setDeleteId(null)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {/* 成功消息提示 */}
      {showSuccessMessage && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, minWidth: 400, maxWidth: 500, boxShadow: '0 12px 40px rgba(0,0,0,0.15)', 
            padding: 32, position: 'relative', textAlign: 'center'
          }}>
            {/* 图标 */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%', 
              background: isSuccess ? '#10b981' : '#ef4444', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <div style={{ fontSize: 32, color: '#fff', fontWeight: 'bold' }}>
                {isSuccess ? '✓' : '✕'}
              </div>
            </div>
            
            {/* 消息内容 */}
            <div style={{ fontSize: 20, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>
              {isSuccess ? (lang === 'zh' ? '操作成功' : 'Success') : (lang === 'zh' ? '操作失败' : 'Error')}
            </div>
            <div style={{ fontSize: 16, color: '#6b7280', marginBottom: 32 }}>
              {successMessage}
            </div>
            
            {/* 确认按钮 */}
            <button 
              onClick={() => setShowSuccessMessage(false)}
              style={{
                background: isSuccess ? '#10b981' : '#ef4444', color: '#fff', border: 'none', borderRadius: 8,
                fontWeight: 600, fontSize: 16, padding: '12px 32px', cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = isSuccess ? '#059669' : '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.background = isSuccess ? '#10b981' : '#ef4444'}
            >
              {t.confirm}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 