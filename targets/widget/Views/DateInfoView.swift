import SwiftUI

struct DateInfoView: View {
    let weekStr: String
    let dateStr: String
    let dayOfWeekStr: String

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text(weekStr)
                .foregroundColor(Color("AccentBlue"))
                .font(.system(size: 14))
                .padding(.bottom, 4)

            Text(dateStr)
                .foregroundColor(Color("TextPrimary"))
                .font(.system(size: 18))

            Spacer()

            ZStack {
                RoundedRectangle(cornerRadius: 12)
                    .foregroundColor(Color("AccentBlue"))
                Text(dayOfWeekStr)
                    .foregroundColor(.white)
                    .font(.system(size: 14))
            }.frame(width: 64, height: 28)
        }
    }
}
