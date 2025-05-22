"use client";
import React from "react";
import { Button, Checkbox, ConfigProvider, DatePicker, Form, Input, message } from "antd";
import { AuthenRepo } from "@/api/features/authenticate/AuthenRepo";
import SignUpViewModel from "../viewModel/signUpViewModel";
import { useAuth } from "@/context/auth/useAuth";
import { useRouter } from "next/navigation"; // Thêm useRouter
import useColor from "@/hooks/useColor";
import { EyeInvisibleOutlined, EyeOutlined} from '@ant-design/icons';

const SignUpFeature: React.FC = () => {
  const [form] = Form.useForm();
  const { backgroundColor, brandPrimary, backGround, borderColor, theme, brandPrimaryTap } = useColor();
  const router = useRouter(); // Khởi tạo router
  const repo = new AuthenRepo(); // Khởi tạo AuthenRepo
  const { handleSignUp, verifyOTP, loading, otpLoading } = SignUpViewModel(repo);
  const { language, localStrings } = useAuth();

  const onSignUp = async (values: any) => {
     await handleSignUp({
        family_name: values.firstName,
        name: values.lastName,
        email: values.email,
        password: values.password,
        phone_number: values.phone,
        birthday: values.dob.format("DD/MM/YYYY"),
        otp: values.otp,
      });
  };

  const onRequestOTP = async () => {

      const email = form.getFieldValue("email");
      if (!email) {
        message.error(`${localStrings.Form.RequiredMessages.EmailRequiredMessage}`);
        return;
      }
      await verifyOTP({ email });
    
  };

  return (
      <ConfigProvider 
            theme={{token: {
              colorPrimary: brandPrimary,
              colorText: brandPrimary,
            },
              components: {
                Input: {
                  colorBgContainer: backGround,
                  colorText: brandPrimary,
                  colorBorder: brandPrimary,
                  colorTextPlaceholder: "gray",
                },
                Button: {
                  colorBgContainer: backgroundColor,
                  colorPrimary: brandPrimary,
                  colorPrimaryHover: brandPrimaryTap,
                },
                DatePicker: {
                  colorBgContainer: backGround,
                  colorBorder: brandPrimary,
                },
                Checkbox: {
                  colorBgContainer: backgroundColor,
                  colorBorder: brandPrimary,
                },
              },
            }}
          >
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: backGround }}>
      <div className="w-full max-w-lg p-8 borderrounded-lg shadow-md rounded-lg" style={{ backgroundColor: backgroundColor, border: `1px solid ${borderColor}`, borderRadius: "8px" }}>
        
        {/* Title */}
        <img
            src={theme === "light" ? "/image/yourvibes_black.png" : "/image/yourvibes _white.png"} 
          alt="YourVibes"
          className="mx-auto mb-4 w-32 h-auto"
        />

        {/* Form */}
        <Form form={form} layout="vertical" onFinish={onSignUp}>
          {/* First and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="firstName"
              rules={[{ required: true, message: localStrings.Form.RequiredMessages.FamilyNameRequiredMessage }]}
            >
              <Input placeholder={localStrings.Form.Label.FamilyName} className="w-full" />
            </Form.Item>

            <Form.Item
              name="lastName"
              rules={[{ required: true, message: localStrings.Form.RequiredMessages.NameRequiredMessage }]}
            >
              <Input placeholder={localStrings.Form.Label.Name} className="w-full" />
            </Form.Item>
          </div>

          {/* Date of Birth */}
          <Form.Item
            name="dob"
            rules={[
              { required: true, message: localStrings.Form.RequiredMessages.BirthDayRequiredMessage },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const today = new Date();
                  const selectedDate = value;
                  if (selectedDate > today) {
                    return Promise.reject(new Error(localStrings.Form.RequiredMessages.BirthDayInvalidMessage));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              placeholder={localStrings.Form.Label.BirthDay}
              
              className="w-full"
              format="DD/MM/YYYY"
              disabledDate={(current) => {
                const today = new Date();
                return current.toDate() > today;
              }}
            />
          </Form.Item>

          {/* Phone Number */}
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: localStrings.Form.RequiredMessages.PhoneRequiredMessage },
              {
                pattern: /^\d{10}$/,
                message: localStrings.Form.RequiredMessages.PhoneInvalidMessage,
              },
            ]}
          >
            <Input placeholder={localStrings.Public.Phone} className="w-full" />
          </Form.Item>

          {/* Email and OTP */}
          <div className="grid grid-cols-3 gap-4">
            <Form.Item
              name="email"
              className="col-span-2"
              rules={[
                { required: true, message: localStrings.Form.RequiredMessages.EmailRequiredMessage },
                {
                  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: localStrings.Form.RequiredMessages.InvalidEmailMessage,
                },
              ]}
            >
              <Input placeholder="Email" className="w-full" />
            </Form.Item>
            <Button
              block
              type="default"
              className="bg-black text-white rounded"
              loading={otpLoading}
              onClick={onRequestOTP}
            >
              {localStrings.Form.Label.GetOTP}
            </Button>
          </div>

          {/* Confirm OTP */}
          <Form.Item
            name="otp"
            rules={[{ required: true, message: localStrings.Form.RequiredMessages.OTPRequiredMessage }]}
          >
            <Input placeholder={localStrings.Form.Label.OTP} className="w-full" />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: localStrings.Form.RequiredMessages.PasswordRequiredMessage },
              {
                min: 8,
                message: localStrings.Form.RequiredMessages.PasswordMinLengthMessage,
              },
            ]}
          >
            <Input.Password placeholder={localStrings.Form.Label.Password} className="w-full"  iconRender={(visible) =>
    visible ? (
      <EyeOutlined style={{ color: "gray" }} />
    ) : (
      <EyeInvisibleOutlined style={{ color: "gray" }} />
    )
  } />
            
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: localStrings.Form.RequiredMessages.ConfirmPasswordRequiredMessage },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject({
                    message: localStrings.Form.RequiredMessages.ConfirmPasswordRequiredMessage,
                  });
                },
              }),
            ]}
          >
            <Input.Password placeholder={localStrings.Form.Label.ConfirmPassword} className="w-full"  iconRender={(visible) =>
    visible ? (
      <EyeOutlined style={{ color: "gray" }} />
    ) : (
      <EyeInvisibleOutlined style={{ color: "gray" }} />
    )
  }/>
          </Form.Item>

          {/* Terms and Conditions */}
          <Form.Item
            name="terms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(localStrings.Form.RequiredMessages.AgreeRequiredMessage),
              },
            ]}
          >
            <Checkbox>{localStrings.SignUp.AgreePolicies}</Checkbox>
          </Form.Item>

          {/* Submit Button */}
          <Button
            type="default"
            block
            size="large"
            htmlType="submit"
            loading={loading}
            className="mt-4 font-bold bg-black text-white rounded"
          >
            {localStrings.SignUp.SignUpButton}
          </Button>

          {/* Additional Links */}
          <div className="mt-4 text-center">
            <span>
              {localStrings.SignUp.AlreadyHaveAccount}{" "}
              <a href="/login" className="text-blue-500">
                {localStrings.SignUp.LoginNow}
              </a>
            </span>
          </div>
        </Form>
      </div>
    </div>
    </ConfigProvider>
  );
};

export default SignUpFeature;