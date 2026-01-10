
import React, { useState, useEffect } from 'react';
import { UserProfile, Withdrawal } from '../types';
import { supabase } from '../supabase';

interface WithdrawPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

const WithdrawPage: React.FC<WithdrawPageProps> = ({ profile, refreshProfile }) => {
  const [method, setMethod] = useState<'bank' | 'garena' | 'zing'>('bank');
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
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
      return alert('Vui lòng điền đầy đủ thông tin ngân hàng thụ hưởng!');
    }
    if ((method === 'garena' || method === 'zing') && (!recipientEmail || !recipientEmail.includes('@'))) {
      return alert('Vui lòng điền Gmail chính xác để nhận mã thẻ game!');
    }

    setLoading(true);
    try {
      // 1. Kiểm tra số dư thực tế tại thời điểm rút
      const { data: currentProfile, error: fetchErr } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', profile.id)
        .single();

      if (fetchErr) throw new Error("Không thể kết nối máy chủ ví.");
      
      const realBalance = currentProfile.balance || 0;
      if (!isAdmin && val > realBalance) {
        throw new Error('Số dư của bạn không đủ để thực hiện lệnh này.');
      }

      // 2. Tạo bản ghi yêu cầu rút tiền
      const { error: withdrawError } = await supabase
        .from('withdrawals')
        .insert([{ 
          user_id: profile.id, 
          amount: val, 
          method: method, 
          status: 'pending',
          bank_name: method === 'bank' ? bankName : method.toUpperCase(),
          account_number: method === 'bank' ? accountNumber : recipientEmail,
          recipient_email: recipientEmail || null
        }]);

      if (withdrawError) throw withdrawError;

      // 3. Trừ tiền tài khoản (Nếu không phải admin)
      if (!isAdmin) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ balance: realBalance - val })
          .eq('id', profile.id);
        if (profileError) throw profileError;
      }

      alert('Đã gửi yêu cầu rút tiền thành công! Hệ thống sẽ xử lý trong vòng 24h.');
      setAmount('');
      setBankName('');
      setAccountNumber('');
      setRecipientEmail('');
      fetchHistory();
      refreshProfile();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Card Số dư */}
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-[48px] p-12 relative overflow-hidden shadow-2xl border border-white/10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full translate-x-32 -translate-y-32"></div>
            <p className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-4">SỐ DƯ KHẢ DỤNG</p>
            <h2 className="text-6xl font-black text-white mb-10 tracking-tight">
              {isAdmin ? '∞ UNLIMITED' : `${(profile.balance || 0).toLocaleString()}đ`}
            </h2>
            <div className="flex gap-4">
               <div className="bg-white/10 px-6 py-3 rounded-2xl text-[9px] font-black text-white uppercase tracking-widest border border-white/10 flex items-center gap-2">
                 🛡️ CỔNG THANH TOÁN BẢO MẬT
               </div>
            </div>
          </div>

          {/* Form Rút tiền */}
          <div className="bg-[#151a24] rounded-[48px] p-12 border border-gray-800 shadow-xl">
             <h3 className="text-2xl font-black text-white mb-10 tracking-tight">Chọn phương thức nhận tiền</h3>
             
             <div className="grid grid-cols-3 gap-6 mb-12">
                <button onClick={() => setMethod('bank')} className={`p-8 rounded-[38px] border-2 transition-all flex flex-col items-center gap-4 ${method === 'bank' ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}>
                   <span className="text-4xl">🏛️</span>
                   <span className="text-[10px] font-black uppercase tracking-widest">Ngân hàng</span>
                </button>
                <button onClick={() => setMethod('garena')} className={`p-8 rounded-[38px] border-2 transition-all flex flex-col items-center gap-4 ${method === 'garena' ? 'border-red-500 bg-red-500/10 text-white' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}>
                   <span className="text-4xl">🎮</span>
                   <span className="text-[10px] font-black uppercase tracking-widest">Thẻ Garena</span>
                </button>
                <button onClick={() => setMethod('zing')} className={`p-8 rounded-[38px] border-2 transition-all flex flex-col items-center gap-4 ${method === 'zing' ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}>
                   <span className="text-4xl">🪙</span>
                   <span className="text-[10px] font-black uppercase tracking-widest">Thẻ Zing</span>
                </button>
             </div>

             <div className="space-y-10">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-4 text-center sm:text-left">Số tiền muốn rút (Min 10.000đ)</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="VD: 50000" 
                    className="w-full bg-gray-900 border border-gray-800 rounded-[28px] py-7 px-10 text-white font-black text-4xl focus:border-blue-500 outline-none transition-all placeholder-gray-800 text-center sm:text-left" 
                  />
                </div>

                {method === 'bank' ? (
                  <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-4">Tên ngân hàng (MB, VCB...)</label>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Tên ngân hàng" className="w-full bg-gray-900 border border-gray-800 rounded-[24px] py-5 px-8 text-white text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-4">Số tài khoản</label>
                      <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="STK thụ hưởng" className="w-full bg-gray-900 border border-gray-800 rounded-[24px] py-5 px-8 text-white text-sm focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-bottom-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-4">Gmail nhận mã thẻ {method.toUpperCase()}</label>
                    <input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="email-cua-ban@gmail.com" className="w-full bg-gray-900 border border-gray-800 rounded-[24px] py-5 px-8 text-white text-sm focus:border-blue-500 outline-none" />
                    <p className="mt-4 text-[9px] text-gray-600 italic px-4 font-bold tracking-wider uppercase">* Hệ thống sẽ gửi Serials & Mã pin về Gmail này.</p>
                  </div>
                )}
             </div>

             <button 
                onClick={handleWithdraw} 
                disabled={loading} 
                className="w-full mt-14 bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-[32px] transition-all disabled:opacity-50 text-xl flex items-center justify-center gap-4 shadow-2xl shadow-blue-900/30 uppercase tracking-widest"
             >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'GỬI YÊU CẦU THANH TOÁN'}
             </button>
          </div>
        </div>

        {/* Lịch sử giao dịch */}
        <div className="bg-[#151a24] rounded-[48px] p-12 border border-gray-800 shadow-xl h-fit">
           <h3 className="text-xl font-black text-white uppercase tracking-widest mb-10">Lịch sử giao dịch</h3>
           <div className="space-y-6">
              {history.map(item => (
                <div key={item.id} className="p-8 bg-gray-900/40 rounded-[32px] border border-gray-800/60 group hover:border-blue-500/20 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-white font-black text-2xl">{item.amount.toLocaleString()}đ</p>
                    <span className={`text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                      item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                      item.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                      'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {item.status === 'pending' ? 'Chờ duyệt' : item.status === 'completed' ? 'Xong' : 'Hủy'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.1em] truncate">{item.method} • {item.account_number}</p>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-24 opacity-20 uppercase text-[10px] font-black tracking-[0.3em]">
                   <span className="text-5xl block mb-6 grayscale">🧾</span>
                   Chưa có dữ liệu
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
