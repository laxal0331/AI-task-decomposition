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
    roleCategory: '职业类别',
    allRoles: '全部职业',
    clearFilters: '清除筛选',
    clearAllFilters: '清除所有筛选',
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
    roleCategory: 'Role Category',
    allRoles: 'All Roles',
    clearFilters: 'Clear Filters',
    clearAllFilters: 'Clear all filters',
  },
};

import { roleMapping, roles } from '../lib/constants/developerRoles';

export default function DeveloperManagement() {
  const router = useRouter();
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = texts[lang];
  const [developers, setDevelopers] = useState<any[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
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
      if (process.env.NODE_ENV !== 'production') console.error('Fetch developers error:', error);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  // 搜索和筛选逻辑
  useEffect(() => {
    let filtered = developers;
    
    // 按搜索词筛选
    if (searchTerm.trim()) {
      filtered = filtered.filter(developer => {
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
    }
    
    // 按角色筛选
    if (selectedRole) {
      filtered = filtered.filter(developer => {
        let developerRole = '';
        if (Array.isArray(developer.roles)) {
          developerRole = developer.roles[0] || '';
        } else if (typeof developer.roles === 'string') {
          try {
            const parsedRoles = JSON.parse(developer.roles);
            developerRole = Array.isArray(parsedRoles) ? parsedRoles[0] : developer.roles;
          } catch (e) {
            developerRole = developer.roles || '';
          }
        } else {
          developerRole = developer.roles || '';
        }
        
        // 使用角色映射进行匹配
        // 如果选中的角色与开发者角色直接匹配，或者通过映射匹配，则返回true
        return developerRole === selectedRole || 
               roleMapping[developerRole] === selectedRole || 
               roleMapping[selectedRole] === developerRole;
      });
    }
    
    setFilteredDevelopers(filtered);
  }, [searchTerm, selectedRole, developers]);

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
      if (process.env.NODE_ENV !== 'production') console.error('Submit error:', error);
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
      if (process.env.NODE_ENV !== 'production') console.error('Delete error:', error);
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', height: '100vh', overflow: 'auto', backgroundImage: 'url(/bg-client.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(16,24,40,0.32)', zIndex: 0, pointerEvents: 'none' }} />
      <div className="max-w-4xl mx-auto mt-16 p-6" style={{ position: 'relative', zIndex: 1 }}>
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

      <h1 className="text-3xl font-bold mb-8" style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>{t.title}</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}>
        <button
          className="btn"
          onClick={() => router.push('/client-view')}
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
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}>{t.developerList}</h2>
        
                {/* 搜索和筛选区域 */}
        <div style={{ 
          marginBottom: 24, 
          color: '#fff', 
          textShadow: '0 1px 4px rgba(0,0,0,0.18)',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          padding: 24,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ 
            display: 'flex',
            gap: 20,
            alignItems: 'flex-end',
            flexWrap: 'wrap'
          }}>
            {/* 搜索框 */}
            <div style={{ 
              position: 'relative', 
              flex: 1,
              minWidth: 320,
              maxWidth: 450
            }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 14, 
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '0.5px'
              }}>
                {lang === 'zh' ? '🔍 搜索开发者' : '🔍 Search Developers'}
              </label>
              <div style={{
                position: 'relative',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="text"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={lang === 'zh' ? '输入姓名、角色、技能关键词...' : 'Enter name, role, skills...'}
                                     style={{
                     width: '100%',
                     padding: '16px 20px 16px 48px',
                     borderRadius: 12,
                     border: 'none',
                     fontSize: 15,
                     outline: 'none',
                     color: '#222',
                     background: 'transparent',
                     transition: 'all 0.3s ease'
                   }}
                  onFocus={(e) => {
                    e.target.parentElement!.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.3)';
                    e.target.parentElement!.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.parentElement!.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    e.target.parentElement!.style.transform = 'translateY(0)';
                  }}
                />
                                 <div style={{
                   position: 'absolute',
                   left: 16,
                   top: '50%',
                   transform: 'translateY(-50%)',
                   color: '#1890ff',
                   fontSize: 16,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   width: 24,
                   height: 24,
                   pointerEvents: 'none'
                 }}>
                   🔍
                 </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(24, 144, 255, 0.1)',
                      border: 'none',
                      color: '#1890ff',
                      cursor: 'pointer',
                      fontSize: 16,
                      padding: 6,
                      borderRadius: 6,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(24, 144, 255, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(24, 144, 255, 0.1)';
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* 角色筛选器 */}
            <div style={{ minWidth: 220 }}>
              <label style={{ 
                display: 'block', 
                marginBottom: 8, 
                fontSize: 14, 
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '0.5px'
              }}>
                {lang === 'zh' ? '🎯 职业类别' : '🎯 Role Category'}
              </label>
              <div style={{
                position: 'relative',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: 'none',
                    fontSize: 15,
                    outline: 'none',
                    color: '#222',
                    background: 'transparent',
                    cursor: 'pointer',
                    appearance: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.parentElement!.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.3)';
                    e.target.parentElement!.style.transform = 'translateY(-2px)';
                  }}
                  onBlur={(e) => {
                    e.target.parentElement!.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    e.target.parentElement!.style.transform = 'translateY(0)';
                  }}
                >
                  <option value="">{t.allRoles}</option>
                  {roles[lang].map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <div style={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#1890ff',
                  fontSize: 16,
                  pointerEvents: 'none'
                }}>
                  ▼
                </div>
              </div>
            </div>

            {/* 清除筛选按钮 */}
            {(searchTerm || selectedRole) && (
              <div style={{ minWidth: 120 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: 8, 
                  fontSize: 14, 
                  fontWeight: 600,
                  color: '#fff',
                  letterSpacing: '0.5px'
                }}>
                  {lang === 'zh' ? '🔄 操作' : '🔄 Actions'}
                </label>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('');
                  }}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  {t.clearFilters}
                </button>
              </div>
            )}
          </div>

          {/* 筛选结果提示 */}
          {(searchTerm || selectedRole) && (
            <div style={{ 
              marginTop: 16,
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                fontSize: 14,
                color: '#e0e7ef'
              }}>
                <span style={{ fontSize: 16 }}>📊</span>
                <span>
                  {lang === 'zh' 
                    ? `找到 ${filteredDevelopers.length} 个开发者` 
                    : `Found ${filteredDevelopers.length} developers`
                  }
                </span>
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '6px 12px',
                  borderRadius: 6,
                  transition: 'all 0.2s ease',
                  fontWeight: 500
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                {t.clearAllFilters}
              </button>
            </div>
          )}
        </div>
        {filteredDevelopers.length === 0 ? (
          <div style={{ color: '#e0e7ef', textAlign: 'center', padding: 32, textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}>
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
                        <div>{lang === 'zh' ? '技能' : 'Skills'}: {(() => {
                          // 技能翻译映射
                          const skillMap: { [key: string]: string } = {
                            'React': 'React',
                            'Vue': 'Vue',
                            'Angular': 'Angular',
                            'Node.js': 'Node.js',
                            'Python': 'Python',
                            'Java': 'Java',
                            'Go': 'Go',
                            'TypeScript': 'TypeScript',
                            'JavaScript': 'JavaScript',
                            'HTML': 'HTML',
                            'CSS': 'CSS',
                            'SQL': 'SQL',
                            'MongoDB': 'MongoDB',
                            'MySQL': 'MySQL',
                            'PostgreSQL': 'PostgreSQL',
                            'Redis': 'Redis',
                            'Docker': 'Docker',
                            'Kubernetes': 'Kubernetes',
                            'AWS': 'AWS',
                            'Azure': 'Azure',
                            'GCP': 'GCP',
                            'Git': 'Git',
                            'CI/CD': 'CI/CD',
                            'Jenkins': 'Jenkins',
                            'Jest': 'Jest',
                            'Mocha': 'Mocha',
                            'Selenium': 'Selenium',
                            'Figma': 'Figma',
                            'Sketch': 'Sketch',
                            'Photoshop': 'Photoshop',
                            'Illustrator': 'Illustrator',
                            'UI设计': lang === 'zh' ? 'UI设计' : 'UI Design',
                            'UX设计': lang === 'zh' ? 'UX设计' : 'UX Design',
                            '用户体验': lang === 'zh' ? '用户体验' : 'User Experience',
                            '敏捷开发': lang === 'zh' ? '敏捷开发' : 'Agile Development',
                            '项目管理': lang === 'zh' ? '项目管理' : 'Project Management',
                            'API设计': lang === 'zh' ? 'API设计' : 'API Design',
                            '数据建模': lang === 'zh' ? '数据建模' : 'Data Modeling',
                            '测试': lang === 'zh' ? '测试' : 'Testing',
                            '自动化': lang === 'zh' ? '自动化' : 'Automation',
                            '部署': lang === 'zh' ? '部署' : 'Deployment',
                            '云服务': lang === 'zh' ? '云服务' : 'Cloud Services',
                            '数据库': lang === 'zh' ? '数据库' : 'Database',
                            'Spring': 'Spring',
                            'Express': 'Express',
                            'Django': 'Django',
                            'Flask': 'Flask',
                            'Laravel': 'Laravel',
                            'Ruby on Rails': 'Ruby on Rails',
                            'ASP.NET': 'ASP.NET',
                            'PHP': 'PHP',
                            'C#': 'C#',
                            'C++': 'C++',
                            'C': 'C',
                            'Rust': 'Rust',
                            'Swift': 'Swift',
                            'Kotlin': 'Kotlin',
                            'Scala': 'Scala',
                            'R': 'R',
                            'MATLAB': 'MATLAB',
                            'TensorFlow': 'TensorFlow',
                            'PyTorch': 'PyTorch',
                            'Scikit-learn': 'Scikit-learn',
                            'Pandas': 'Pandas',
                            'NumPy': 'NumPy',
                            'Jupyter': 'Jupyter',
                            'Tableau': 'Tableau',
                            'Power BI': 'Power BI',
                            'Excel': 'Excel',
                            'Word': 'Word',
                            'PowerPoint': 'PowerPoint',
                            'Outlook': 'Outlook',
                            'Slack': 'Slack',
                            'Teams': 'Teams',
                            'Zoom': 'Zoom',
                            'Trello': 'Trello',
                            'Jira': 'Jira',
                            'Confluence': 'Confluence',
                            'Notion': 'Notion',
                            'Airtable': 'Airtable',
                            'Zapier': 'Zapier',
                            'IFTTT': 'IFTTT',
                            'Webflow': 'Webflow',
                            'WordPress': 'WordPress',
                            'Shopify': 'Shopify',
                            'WooCommerce': 'WooCommerce',
                            'Magento': 'Magento',
                            'PrestaShop': 'PrestaShop',
                            'OpenCart': 'OpenCart',
                            'BigCommerce': 'BigCommerce',
                            'Squarespace': 'Squarespace',
                            'Wix': 'Wix',
                            'Weebly': 'Weebly',
                            'Bubble': 'Bubble',
                            'Framer': 'Framer',
                            'InVision': 'InVision',
                            'Marvel': 'Marvel',
                            'ProtoPie': 'ProtoPie',
                            'Principle': 'Principle',
                            'Origami': 'Origami',
                            'Flinto': 'Flinto',
                            'Axure': 'Axure',
                            'Balsamiq': 'Balsamiq',
                            'Lucidchart': 'Lucidchart',
                            'Draw.io': 'Draw.io',
                            'Visio': 'Visio',
                            'OmniGraffle': 'OmniGraffle',
                            'Whimsical': 'Whimsical',
                            'Miro': 'Miro',
                            'Mural': 'Mural',
                            'Stormboard': 'Stormboard',
                            'Conceptboard': 'Conceptboard',
                            'RealtimeBoard': 'RealtimeBoard',
                            'InVision Freehand': 'InVision Freehand',
                            'Figma Jam': 'Figma Jam'
                          };
                          
                          return developer.skills.map((skill: string) => {
                            return skillMap[skill] || skill;
                          }).join(', ');
                        })()}</div>
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
      </div> {/* 内容区div闭合 */}
      <style jsx global>{`
        .search-input::placeholder {
          color: #666;
          opacity: 1;
        }
      `}</style>
    </div> // 外层全屏背景div闭合
  );
} 