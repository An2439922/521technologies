"use client";

import { useEffect, useState } from 'react';
import { Download, Plus, Pencil, Trash2, X, FileText, Upload, LogOut } from 'lucide-react';
import * as xlsx from 'xlsx';
import { format } from 'date-fns';

const RUSSIAN_REGIONS = [
  "Адыгея", "Алтай (Республика)", "Алтайский край", "Амурская область", "Архангельская область", "Астраханская область",
  "Башкортостан", "Белгородская область", "Брянская область", "Бурятия", "Владимирская область", "Волгоградская область",
  "Вологодская область", "Воронежская область", "Дагестан", "ДНР", "Еврейская АО", "Забайкальский край", "Запорожская область",
  "Ивановская область", "Ингушетия", "Иркутская область", "Кабардино-Балкария", "Калининградская область", "Калмыкия",
  "Калужская область", "Камчатский край", "Карачаево-Черкесия", "Карелия", "Кемеровская область", "Кировская область",
  "Коми", "Костромская область", "Краснодарский край", "Красноярский край", "Крым", "Курганская область", "Курская область",
  "Ленинградская область", "Липецкая область", "ЛНР", "Магаданская область", "Марий Эл", "Мордовия", "Москва",
  "Московская область", "Мурманская область", "Ненецкий АО", "Нижегородская область", "Новгородская область",
  "Новосибирская область", "Омская область", "Оренбургская область", "Орловская область", "Пензенская область",
  "Пермский край", "Приморский край", "Псковская область", "Ростовская область", "Рязанская область", "Самарская область",
  "Санкт-Петербург", "Саратовская область", "Саха (Якутия)", "Сахалинская область", "Свердловская область", "Севастополь",
  "Северная Осетия — Алания", "Смоленская область", "Ставропольский край", "Тамбовская область", "Татарстан", "Тверская область",
  "Томская область", "Тульская область", "Тыва", "Тюменская область", "Удмуртия", "Ульяновская область", "Хабаровский край",
  "Хакасия", "Ханты-Мансийский АО", "Херсонская область", "Челябинская область", "Чечня", "Чувашия", "Чукотский АО",
  "Ямало-Ненецкий АО", "Ярославская область"
].sort((a, b) => a.localeCompare(b, 'ru'));

type DocumentData = {
  id: number;
  name: string;
  path: string;
};

type RequestData = {
  id: number;
  programName: string;
  programDate: string | null;
  clientType: string;
  date: string;
  fullName: string;
  phone: string;
  email: string | null;
  peopleCount: number;
  freePeople: number;
  days: number;
  region: string;
  transportCost: number;
  accommodationCost: number;
  guideCost: number;
  excursionCost: number;
  mealsCost: number;
  totalCost: number;
  status: string;
  notes: string | null;
  createdAt: string;
  documents: DocumentData[];
};

export default function Home() {
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RequestData | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    programName: '',
    programDate: '',
    clientType: 'Взрослые',
    fullName: '',
    phone: '',
    email: '',
    peopleCount: 1,
    freePeople: '' as number | string,
    days: '' as number | string,
    region: '',
    transportCost: '' as number | string,
    accommodationCost: '' as number | string,
    guideCost: '' as number | string,
    excursionCost: '' as number | string,
    mealsCost: '' as number | string,
    totalCost: 0,
    status: 'Новая',
    notes: '',
  });

  const handleCostChange = (field: string, value: string) => {
    const parsed = parseInt(value) || 0;
    const newForm = { ...formData, [field]: parsed || '' };
    newForm.totalCost = (Number(newForm.transportCost) || 0) + (Number(newForm.accommodationCost) || 0) + (Number(newForm.guideCost) || 0) + (Number(newForm.excursionCost) || 0) + (Number(newForm.mealsCost) || 0);
    setFormData(newForm);
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      setRequests(data);
      return data;
    } catch (e) {
      console.error(e);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleExport = () => {
    const exportData = requests.map(req => ({
      'ID': req.id,
      'Программа': req.programName,
      'Дата программы': req.programDate ? format(new Date(req.programDate), 'dd.MM.yyyy') : '',
      'Дней': req.days,
      'Тип клиента': req.clientType,
      'Дата создания': format(new Date(req.createdAt), 'dd.MM.yyyy HH:mm'),
      'ФИО клиента': req.fullName,
      'Регион поездки': req.region || '-',
      'Телефон': req.phone,
      'Email': req.email || '',
      'Кол-во человек': req.peopleCount,
      'Бесплатных': req.freePeople,
      'Дней': req.days,
      'Транспорт': req.transportCost || 0,
      'Размещение': req.accommodationCost || 0,
      'Гид': req.guideCost || 0,
      'Экскурсии': req.excursionCost || 0,
      'Питание': req.mealsCost || 0,
      'Итоговая стоимость': req.totalCost || 0,
      'Статус': req.status,
      'Комментарий': req.notes || ''
    }));

    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Заявки");
    
    const currentDate = format(new Date(), 'dd.MM.yyyy_HH-mm');
    xlsx.writeFile(wb, `Заявки_Маруссия_${currentDate}.xlsx`);
  };

  const openAddModal = () => {
    setEditingRequest(null);
    setFormData({
      programName: '',
      programDate: '',
      clientType: 'Взрослые',
      fullName: '',
      phone: '',
      email: '',
      peopleCount: 1,
      freePeople: '',
      days: '',
      region: '',
      transportCost: '',
      accommodationCost: '',
      guideCost: '',
      excursionCost: '',
      mealsCost: '',
      totalCost: 0,
      status: 'Новая',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (req: RequestData) => {
    setEditingRequest(req);
    setFormData({
      programName: req.programName,
      programDate: req.programDate || '',
      clientType: req.clientType || 'Взрослые',
      fullName: req.fullName,
      phone: req.phone,
      email: req.email || '',
      peopleCount: req.peopleCount,
      freePeople: req.freePeople || '',
      days: req.days || '',
      region: req.region || '',
      transportCost: req.transportCost || '',
      accommodationCost: req.accommodationCost || '',
      guideCost: req.guideCost || '',
      excursionCost: req.excursionCost || '',
      mealsCost: req.mealsCost || '',
      totalCost: req.totalCost || 0,
      status: req.status,
      notes: req.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить заявку? Документы также будут удалены.')) return;
    try {
      await fetch(`/api/requests/${id}`, { method: 'DELETE' });
      fetchRequests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRequest) {
        await fetch(`/api/requests/${editingRequest.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      fetchRequests();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingRequest || !e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await fetch(`/api/requests/${editingRequest.id}/documents`, {
        method: 'POST',
        body: data,
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Ошибка загрузки файла");
      }
      
      const updatedData = await fetchRequests();
      const updatedReq = updatedData.find((r: any) => r.id === editingRequest.id);
      if (updatedReq) setEditingRequest(updatedReq);
    } catch (e) {
      alert("Ошибка сети при загрузке файла");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!confirm('Удалить этот документ?')) return;
    try {
      await fetch(`/api/requests/${editingRequest!.id}/documents/${docId}`, { method: 'DELETE' });
      const updatedData = await fetchRequests();
      const updatedReq = updatedData.find((r: any) => r.id === editingRequest?.id);
      if (updatedReq) setEditingRequest(updatedReq);
    } catch (e) {
      alert("Ошибка при удалении документа");
    }
  };

  const getStatusClass = (status: string) => {
    return `status-${status.replace(/\s+/g, '.')}`;
  };

  const getRowClass = (days: number) => {
    let base = "clickable-row";
    if (days === 1) base += " row-days-single";
    else if (days > 1) base += " row-days-multiple";
    return base;
  };

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = '/login';
  };

  if (loading) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>Загрузка...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Учет заявок</h1>
        <div className="header-actions">
          <button onClick={handleExport} className="btn btn-outline">
            <Download size={18} /> Экспорт в Excel
          </button>
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} /> Новая заявка
          </button>
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.6rem' }} title="Выйти">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Создана</th>
                <th>Программа</th>
                <th>Дата старта</th>
                <th>Дней</th>
                <th>Регион</th>
                <th>Тип</th>
                <th>Клиент</th>
                <th>Телефон</th>
                <th>Итого</th>
                <th>Людей</th>
                <th>Файлы</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} onClick={() => openEditModal(req)} className={getRowClass(req.days)}>
                  <td>#{req.id}</td>
                  <td>{format(new Date(req.createdAt), 'dd.MM.yyyy')}</td>
                  <td>{req.programName}</td>
                  <td>{req.programDate ? format(new Date(req.programDate), 'dd.MM.yyyy') : '-'}</td>
                  <td>{req.days}</td>
                  <td>{req.region || '-'}</td>
                  <td>{req.clientType}</td>
                  <td>{req.fullName}</td>
                  <td>{req.phone}</td>
                  <td>{req.totalCost ? `${req.totalCost} ₽` : '-'}</td>
                  <td>
                    {req.peopleCount} 
                    {req.freePeople > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85em', marginLeft: '4px' }}>+{req.freePeople}</span>}
                  </td>
                  <td>
                    {req.documents?.length > 0 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--primary)' }}>
                        <FileText size={14} /> {req.documents.length}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(req.status)}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(req); }} className="icon-btn" title="Редактировать">
                        <Pencil size={18} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(req.id); }} className="icon-btn icon-btn-danger" title="Удалить">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={15} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Заявок пока нет. Нажмите "Новая заявка", чтобы добавить первую.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingRequest ? 'Редактировать заявку' : 'Новая заявка'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div style={{ flex: 2 }}>
                  <label className="form-label">Название программы/тура</label>
                  <input required className="form-input" value={formData.programName} onChange={e => setFormData({...formData, programName: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Дата начала</label>
                  <input type="date" className="form-input" value={formData.programDate} onChange={e => setFormData({...formData, programDate: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Дней</label>
                  <input type="number" min="1" className="form-input" placeholder="Кол-во" value={formData.days} onChange={e => setFormData({...formData, days: e.target.value ? parseInt(e.target.value) : ''})} />
                </div>
              </div>

              <div className="form-row">
                <div style={{ flex: 2 }}>
                  <label className="form-label">Регион поездки</label>
                  <input 
                    required 
                    list="regions" 
                    className="form-input" 
                    placeholder="Начните вводить..." 
                    value={formData.region} 
                    onChange={e => setFormData({...formData, region: e.target.value})} 
                  />
                  <datalist id="regions">
                    {RUSSIAN_REGIONS.map(r => <option key={r} value={r} />)}
                  </datalist>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Тип заявки</label>
                  <select className="form-select" value={formData.clientType} onChange={e => setFormData({...formData, clientType: e.target.value})}>
                    <option>Взрослые</option>
                    <option>Школьники</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Люди (осн+доп)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input required type="number" min="1" className="form-input" placeholder="Осн." title="Основные" value={formData.peopleCount} onChange={e => setFormData({...formData, peopleCount: parseInt(e.target.value) || 0})} />
                    <input type="number" min="0" className="form-input" placeholder="+ Доп." title="Бесплатные" value={formData.freePeople} onChange={e => setFormData({...formData, freePeople: e.target.value ? parseInt(e.target.value) : ''})} />
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">ФИО клиента</label>
                <input required className="form-input" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              
              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <label className="form-label">Телефон</label>
                  <input required className="form-input" placeholder="+7..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Email (необязательно)</label>
                  <input type="email" className="form-input" placeholder="mail@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Стоимость (₽)</h3>
              
              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <label className="form-label">Транспорт</label>
                  <input type="number" min="0" className="form-input" value={formData.transportCost} onChange={e => handleCostChange('transportCost', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Размещение</label>
                  <input type="number" min="0" className="form-input" value={formData.accommodationCost} onChange={e => handleCostChange('accommodationCost', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Гид</label>
                  <input type="number" min="0" className="form-input" value={formData.guideCost} onChange={e => handleCostChange('guideCost', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div style={{ flex: 1 }}>
                  <label className="form-label">Экскурсии</label>
                  <input type="number" min="0" className="form-input" value={formData.excursionCost} onChange={e => handleCostChange('excursionCost', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Питание</label>
                  <input type="number" min="0" className="form-input" value={formData.mealsCost} onChange={e => handleCostChange('mealsCost', e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Итоговая стоимость</label>
                  <input type="number" className="form-input" disabled style={{ background: '#f9fafb', fontWeight: 'bold' }} value={formData.totalCost} />
                </div>
              </div>

              {editingRequest && (
                <div className="form-group">
                  <label className="form-label">Статус</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option>Новая</option>
                    <option>Заказано частично</option>
                    <option>Заказано всё</option>
                    <option>Ждём оплату</option>
                    <option>Оплачено</option>
                    <option>Проведена</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Комментарии / Пожелания</label>
                <textarea className="form-textarea" rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
              </div>

              {editingRequest && (
                <div className="form-group" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Прикрепленные документы (.doc, .pdf)</label>
                    <label className="btn btn-outline" style={{ cursor: uploading ? 'wait' : 'pointer', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      <Upload size={14} /> {uploading ? 'Загрузка...' : 'Добавить'}
                      <input type="file" style={{ display: 'none' }} accept=".pdf,.doc,.docx" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                  
                  {editingRequest.documents && editingRequest.documents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {editingRequest.documents.map(doc => (
                        <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem' }}>
                          <a href={doc.path} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', textDecoration: 'none' }}>
                            <FileText size={16} />
                            {doc.name}
                          </a>
                          <button type="button" onClick={() => handleDeleteDocument(doc.id)} className="icon-btn icon-btn-danger" title="Удалить документ">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Нет загруженных документов.</div>
                  )}
                </div>
              )}

              <div className="form-row" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Отмена</button>
                <button type="submit" className="btn btn-primary">
                  {editingRequest ? 'Сохранить изменения' : 'Создать заявку'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
