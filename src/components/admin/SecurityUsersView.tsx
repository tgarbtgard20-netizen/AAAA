/**
 * Aronium Management - Users & Security View (المستخدمين والامن • إدارة)
 */
import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Key, Lock, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { User } from '../../types';

interface SecurityUsersViewProps {
  users: User[];
  onSaveUser: (user: User) => void;
}

export const SecurityUsersView: React.FC<SecurityUsersViewProps> = ({
  users,
  onSaveUser,
}) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('123');
  const [formPin, setFormPin] = useState('1234');
  const [formRole, setFormRole] = useState<'admin' | 'cashier' | 'manager'>('cashier');

  const handleOpenAdd = () => {
    setEditingUser({
      id: 'u_' + Date.now(),
      name: '',
      username: '',
      password: '123',
      pin: '0000',
      role: 'cashier',
    });
    setFormName('');
    setFormUsername('');
    setFormPassword('123');
    setFormPin('0000');
    setFormRole('cashier');
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormUsername(u.username || '');
    setFormPassword(u.password || '123');
    setFormPin(u.pin);
    setFormRole(u.role);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formUsername) return;
    const updated: User = {
      id: editingUser ? editingUser.id : 'u_' + Date.now(),
      name: formName,
      username: formUsername,
      password: formPassword,
      pin: formPin,
      role: formRole,
    };
    onSaveUser(updated);
    setEditingUser(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#181a1f] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      {/* Action Toolbar */}
      <div className="h-12 bg-[#22262d] border-b border-[#313742] flex items-center justify-between px-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={15} />
            <span>إضافة مستخدم جديد</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-400">
          إدارة حسابات الكاشير والصلاحيات وكلمات المرور
        </div>
      </div>

      {/* Users Table */}
      <div className="flex-1 overflow-y-auto bg-[#17191d] p-4">
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-lg overflow-hidden">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-[#242933] text-gray-300 font-bold border-b border-[#313742]">
              <tr>
                <th className="py-2.5 px-3">اسم الموظف / الكاشير</th>
                <th className="py-2.5 px-3">اسم المستخدم (Login)</th>
                <th className="py-2.5 px-3">كلمة المرور</th>
                <th className="py-2.5 px-3 text-center">رمز PIN السريع</th>
                <th className="py-2.5 px-3">الدور / الصلاحية</th>
                <th className="py-2.5 px-3 text-center">الصلاحيات الممنوحة</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282d38]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#222730] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                    <UserCheck size={15} className="text-cyan-400" />
                    <span>{u.name}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300 font-bold">{u.username}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-300">{u.password || '123'}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400">
                    {u.pin}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                          : u.role === 'manager'
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {u.role === 'admin' ? 'مدير نظام كامل' : u.role === 'manager' ? 'محاسب مالي' : 'كاشير نقاط بيع'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center text-[11px] text-gray-300">
                    {u.role === 'admin'
                      ? 'كافة الصلاحيات والتقارير'
                      : 'البيع وإصدار الفواتير والقبض'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="px-2.5 py-1 rounded bg-[#2b3340] hover:bg-[#364254] text-cyan-300 text-xs font-bold cursor-pointer"
                    >
                      تعديل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#20252e] border border-[#384150] rounded-xl shadow-2xl w-full max-w-md p-4 text-xs space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-cyan-400" />
              <span>إدارة بيانات المستخدم والصلاحيات</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: محمد - كاشير وردية الصباح"
                  className="w-full h-9 bg-[#15171b] border border-[#384150] rounded px-3 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">اسم المستخدم (Login):</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="مثال: cashier2"
                  className="w-full h-9 bg-[#15171b] border border-[#384150] rounded px-3 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">كلمة المرور:</label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full h-9 bg-[#15171b] border border-[#384150] rounded px-3 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">رمز PIN السريع:</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={formPin}
                    onChange={(e) => setFormPin(e.target.value)}
                    className="w-full h-9 bg-[#15171b] border border-[#384150] rounded px-3 text-white font-mono text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">الدور والصلاحية:</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full h-9 bg-[#15171b] border border-[#384150] rounded px-3 text-white"
                >
                  <option value="cashier">كاشير نقاط بيع (بيع فقط)</option>
                  <option value="manager">محاسب مالي (مبيعات ومصروفات)</option>
                  <option value="admin">مدير نظام كامل (إدارة شاملة)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#2e343f]">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded cursor-pointer shadow"
                >
                  حفظ الحساب
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-[#2a303a] text-gray-300 rounded cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
