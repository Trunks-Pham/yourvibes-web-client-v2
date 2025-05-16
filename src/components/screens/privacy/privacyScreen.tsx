import React from 'react';

const PrivacyScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Chính Sách Bảo Mật và Điều Khoản Sử Dụng YourVibes</h1>
        <p className="text-gray-600 mb-4">
          Tại YourVibes, chúng tôi cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn. Chính sách bảo mật và điều khoản sử dụng này giải thích cách chúng tôi thu thập, sử dụng, chia sẻ và bảo vệ thông tin của bạn, cũng như các quy định về nội dung bạn đăng trên nền tảng của chúng tôi.
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">1. Thông Tin Chúng Tôi Thu Thập</h2>
          <p className="text-gray-600">
            Chúng tôi thu thập các loại thông tin sau để cung cấp và cải thiện dịch vụ:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>
              <strong>Thông tin bạn cung cấp:</strong> Bao gồm tên, email, ngày sinh, ảnh đại diện, và nội dung bạn đăng trên YourVibes (bài viết, bình luận). Bạn chịu trách nhiệm đảm bảo nội dung đăng tải không vi phạm các quy định của chúng tôi.
            </li>
            <li>
              <strong>Thông tin tự động thu thập:</strong> Dữ liệu về hoạt động của bạn như bài viết bạn thích, tương tác, thời gian sử dụng, và thông tin thiết bị (địa chỉ IP, loại trình duyệt, hệ điều hành).
            </li>
            <li>
              <strong>Thông tin từ bên thứ ba:</strong> Nếu bạn kết nối tài khoản YourVibes với các nền tảng khác (như Google hoặc Facebook), chúng tôi có thể nhận thông tin từ các nền tảng đó theo chính sách của họ.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Cách Chúng Tôi Sử Dụng Thông Tin</h2>
          <p className="text-gray-600">
            Thông tin của bạn được sử dụng để:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Cung cấp và cá nhân hóa trải nghiệm của bạn trên YourVibes.</li>
            <li>Phân tích dữ liệu để cải thiện dịch vụ và phát triển các tính năng mới.</li>
            <li>Gửi thông báo, cập nhật, hoặc quảng cáo phù hợp với sở thích của bạn (bạn có thể tắt tùy chọn này).</li>
            <li>Phát hiện và ngăn chặn các hoạt động gian lận, vi phạm chính sách, hoặc nội dung không phù hợp như nội dung tiêu cực, đồi trụy, hoặc gây thù hận.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">3. Chia Sẻ Thông Tin</h2>
          <p className="text-gray-600">
            Chúng tôi không bán thông tin cá nhân của bạn. Tuy nhiên, thông tin có thể được chia sẻ trong các trường hợp sau:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>
              <strong>Với người dùng khác:</strong> Nội dung bạn đăng công khai (bài viết, bình luận) sẽ hiển thị cho những người dùng khác, trừ khi nội dung vi phạm chính sách và bị xóa.
            </li>
            <li>
              <strong>Với đối tác:</strong> Chúng tôi có thể chia sẻ dữ liệu ẩn danh với các đối tác để phân tích hoặc quảng cáo.
            </li>
            <li>
              <strong>Theo yêu cầu pháp lý:</strong> Nếu được yêu cầu bởi cơ quan pháp luật, chúng tôi có thể cung cấp thông tin theo quy định, đặc biệt trong các trường hợp liên quan đến nội dung vi phạm pháp luật.
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">4. Quyền Của Bạn</h2>
          <p className="text-gray-600">
            Bạn có quyền kiểm soát thông tin cá nhân của mình, bao gồm:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Truy cập và chỉnh sửa thông tin cá nhân trong cài đặt tài khoản.</li>
            <li>Yêu cầu xóa tài khoản và dữ liệu liên quan (liên hệ qua email support@yourvibes.com).</li>
            <li>Xuất dữ liệu của bạn dưới dạng tệp có thể đọc được.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">5. Bảo Mật Thông Tin</h2>
          <p className="text-gray-600">
            Chúng tôi sử dụng các biện pháp bảo mật tiên tiến như mã hóa dữ liệu và tường lửa để bảo vệ thông tin của bạn. Tuy nhiên, không có hệ thống nào an toàn tuyệt đối, vì vậy chúng tôi khuyến khích bạn sử dụng mật khẩu mạnh và không chia sẻ thông tin tài khoản.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">6. Điều Khoản Sử Dụng và Nội Dung Cấm</h2>
          <p className="text-gray-600">
            Khi sử dụng YourVibes, bạn đồng ý tuân thủ các điều khoản sau:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Không đăng tải hoặc chia sẻ nội dung tiêu cực, đồi trụy, bạo lực, phân biệt đối xử, hoặc bất kỳ nội dung nào vi phạm pháp luật hoặc gây ảnh hưởng xấu đến cộng đồng.</li>
            <li>Không sử dụng nền tảng để phát tán thông tin sai lệch, xúc phạm, hoặc gây thù hận.</li>
            <li>Chúng tôi có quyền xem xét, xóa nội dung vi phạm, hoặc tạm khóa/khóa vĩnh viễn tài khoản của bạn nếu bạn vi phạm các điều khoản này.</li>
            <li>Bạn chịu hoàn toàn trách nhiệm pháp lý đối với nội dung bạn đăng tải.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">7. Thay Đổi Chính Sách</h2>
          <p className="text-gray-600">
            Chúng tôi có thể cập nhật chính sách bảo mật và điều khoản sử dụng này để phản ánh các thay đổi trong dịch vụ hoặc quy định pháp luật. Mọi thay đổi sẽ được thông báo qua email hoặc thông báo trên nền tảng YourVibes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">8. Liên Hệ Với Chúng Tôi</h2>
          <p className="text-gray-600">
            Nếu bạn có câu hỏi hoặc yêu cầu về chính sách bảo mật hoặc điều khoản sử dụng, vui lòng liên hệ qua:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li>Email: support@yourvibes.com</li>
            <li>Hotline: +84 123 456 789</li>
          </ul>
        </section>

        <p className="text-gray-500 text-sm text-center mt-8">
          Chính sách này có hiệu lực từ ngày 04 tháng 09 năm 2024.
        </p>
      </div>
    </div>
  );
};

export default PrivacyScreen;