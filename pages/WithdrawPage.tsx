import React, { useState, useEffect } from 'react';
import { UserProfile, Withdrawal } from '../types';
import { supabase } from '../supabase';

interface WithdrawPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

const WithdrawPage: React.FC<WithdrawPageProps> = ({ profile, refreshProfile }) => {
  const [method, setMethod] = useState<'bank' | 'garena'>('bank');
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Withdrawal[]>([]);

  const isAdmin = profile.role === 'admin';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    if (data) setHistory(data);
  };

  const handleWithdraw = async () => {
    const val = Number(amount);
    if (!val || val < 10000) return alert('Số tiền rút tối thiểu là 10.000đ');
    
    if (method === 'bank' && (!bankName || !accountNumber)) {
      return alert('Vui lòng nhập tên ngân hàng và số tài khoản thụ hưởng');
    }
    if (method === 'garena' && (!accountNumber || !accountNumber.includes('@'))) {
      return alert('Vui lòng nhập chính xác Gmail để nhận mã thẻ Garena');
    }

    if (!isAdmin && val > (profile.balance || 0)) return alert('Số dư hiện tại không đủ để thực hiện lệnh rút này');

    setLoading(true);
    try {
      const { error: withdrawError } = await supabase
        .from('withdrawals')
        .insert([{ 
          user_id: profile.id, 
          amount: val, 
          method, 
          status: isAdmin ? 'completed' : 'pending',
          bank_name: method === 'bank' ? bankName : 'GARENA',
          account_number: accountNumber
        }]);

      if (withdrawError) throw withdrawError;

      if (!isAdmin) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ balance: (profile.balance || 0) - val })
          .eq('id', profile.id);
        if (profileError) throw profileError;
      }

      alert(isAdmin ? 'Admin rút tiền thành công (Đã tự động phê duyệt)!' : 'Gửi yêu cầu thành công! Mã thẻ hoặc tiền sẽ được xử lý trong 15-60 phút.');
      setAmount('');
      setBankName('');
      setAccountNumber('');
      fetchHistory();
      refreshProfile();
    } catch (err: any) {
      alert('Lỗi rút tiền: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-[48px] p-12 relative overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full translate-x-32 -translate-y-32"></div>
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4">SỐ DƯ CÓ THỂ RÚT</p>
            <h2 className="text-6xl font-black text-white mb-10 tracking-tight">
              {isAdmin ? '∞ UNLIMITED' : `${(profile.balance || 0).toLocaleString()}đ`}
            </h2>
            <div className="flex gap-4">
               <div className="bg-white/10 px-5 py-2.5 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                 Bảo mật giao dịch 100%
               </div>
               {isAdmin && (
                 <div className="bg-yellow-400/20 px-5 py-2.5 rounded-2xl text-[10px] font-black text-yellow-100 uppercase tracking-widest border border-yellow-400/20">
                   CHẾ ĐỘ QUẢN TRỊ
                 </div>
               )}
            </div>
          </div>

          <div className="bg-[#151a24] rounded-[48px] p-12 border border-gray-800 shadow-xl">
             <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
                <span className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-900/30">💳</span>
                Chọn phương thức nhận
             </h3>
             
             <div className="grid grid-cols-2 gap-6 mb-12">
                <button onClick={() => { setMethod('bank'); setAccountNumber(''); }} className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group ${method === 'bank' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}>
                   <span className="text-4xl group-hover:scale-110 transition-transform">🏛️</span>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ngân hàng</span>
                </button>
                <button onClick={() => { setMethod('garena'); setAccountNumber(''); }} className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group ${method === 'garena' ? 'border-red-500 bg-red-500/10 text-white' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}>
                   <span className="text-4xl group-hover:scale-110 transition-transform">🎮</span>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em]">Thẻ Garena</span>
                </button>
             </div>

             <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-2">Số tiền muốn rút</label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      placeholder="Nhập số tiền..." 
                      className="w-full bg-gray-900 border border-gray-800 rounded-3xl py-6 px-8 text-white font-black text-3xl focus:border-blue-500 focus:bg-gray-800 outline-none transition-all placeholder-gray-800" 
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-700 font-black text-lg">VNĐ</span>
                  </div>
                </div>

                {method === 'bank' ? (
                  <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Tên Ngân hàng</label>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="VD: MB Bank, Momo..." className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-6 text-white text-sm focus:border-blue-500 outline-none placeholder-gray-700" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Số tài khoản (STK)</label>
                      <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Nhập STK chính xác..." className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-6 text-white text-sm focus:border-blue-500 outline-none placeholder-gray-700" />
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Email nhận mã thẻ Garena</label>
                    <input type="email" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Nhập địa chỉ Gmail của bạn..." className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-6 text-white text-sm focus:border-blue-500 outline-none placeholder-gray-700" />
                    <p className="mt-4 text-[9px] text-gray-600 font-black uppercase ml-2 leading-relaxed">
                      * <span className="text-blue-500">Lưu ý:</span> Mã thẻ sẽ được gửi vào hòm thư Gmail này. Vui lòng kiểm tra kỹ để tránh sai sót.
                    </p>
                  </div>
                )}
             </div>

             <button 
                onClick={handleWithdraw} 
                disabled={loading} 
                className="w-full mt-12 bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[28px] shadow-2xl shadow-blue-900/40 transition-all disabled:opacity-50 text-xl tracking-[0.2em] flex items-center justify-center gap-4 group"
             >
                {loading ? (
                   <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                   <>XÁC NHẬN RÚT <span className="group-hover:translate-x-2 transition-transform">→</span></>
                )}
             </button>
          </div>
        </div>

        <div className="bg-[#151a24] rounded-[48px] p-10 border border-gray-800 shadow-xl h-fit">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-white uppercase tracking-widest">Lịch sử rút</h3>
              <button onClick={fetchHistory} className="text-gray-600 hover:text-blue-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
           </div>
           
           <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} className="p-6 bg-gray-900/50 rounded-3xl border border-gray-800 group hover:bg-gray-800 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-black text-lg">{Number(item.amount).toLocaleString()}đ</p>
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">{item.method === 'bank' ? '🏦 NGÂN HÀNG' : '🎮 GARENA'}</p>
                    </div>
                    <span className={`text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                      item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                      item.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                      'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {item.status === 'pending' ? 'Chờ duyệt' : item.status === 'completed' ? 'Thành công' : 'Đã hủy'}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-800/50">
                    <p className="text-[10px] text-gray-600 font-bold truncate">Nhận qua: {item.account_number}</p>
                    <p className="text-[9px] text-gray-700 mt-1 uppercase font-bold">{new Date(item.created_at).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center">
                   <div className="text-4xl mb-4 opacity-10">📭</div>
                   <p className="text-gray-700 font-bold uppercase text-[10px] tracking-widest">Không có giao dịch</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;