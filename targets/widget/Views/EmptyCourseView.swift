import SwiftUI

struct EmptyCourseView: View {
    var body: some View {
        HStack(spacing: 0) {
            Text("没有更多课啦，放松一下吧～")
                .foregroundColor(Color("TextPrimary"))
                .font(.system(size: 14))
                .padding(.leading, 8)
            Spacer()
        }
    }
}
